package com.adaptivefit.service;

import com.adaptivefit.dto.request.CheckInRequest;
import com.adaptivefit.dto.response.AdaptationResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.*;
import com.adaptivefit.model.enums.FitnessGoal;
import com.adaptivefit.model.enums.IntensityLevel;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdaptiveEngineService {

    private final WeeklyCheckInRepository weeklyCheckInRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final UserProfileRepository userProfileRepository;

    public AdaptiveEngineService(WeeklyCheckInRepository weeklyCheckInRepository,
                                 WorkoutPlanRepository workoutPlanRepository,
                                 NutritionPlanRepository nutritionPlanRepository,
                                 UserProfileRepository userProfileRepository) {
        this.weeklyCheckInRepository = weeklyCheckInRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.nutritionPlanRepository = nutritionPlanRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @Transactional
    public AdaptationResponse processCheckIn(Long userId, CheckInRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        WorkoutPlan currentPlan = workoutPlanRepository
                .findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        NutritionPlan currentNutritionPlan = nutritionPlanRepository
                .findFirstByUserIdOrderByPlanVersionDesc(userId)
                .orElse(null);

        int currentVersion = currentPlan.getVersion();
        List<String> changes = new ArrayList<>();
        List<String> adaptationDetails = new ArrayList<>();

        // Track modifications
        int newDaysPerWeek = currentPlan.getDaysPerWeek();
        IntensityLevel newIntensity = currentPlan.getIntensityLevel();
        int setsAdjustment = 0;
        boolean nutritionChanged = false;
        int calorieAdjustment = 0;

        // Rule 1: Adherence Drop
        if (request.getSessionsCompleted() < currentPlan.getDaysPerWeek() * 0.6) {
            adaptationDetails.add("Adherence Drop");
            if (newDaysPerWeek > 2) {
                newDaysPerWeek--;
                changes.add("Reduced training days from " + currentPlan.getDaysPerWeek() + " to " + newDaysPerWeek + " due to low adherence");
            }
            IntensityLevel reduced = reduceIntensity(newIntensity);
            if (reduced != newIntensity) {
                changes.add("Reduced intensity from " + newIntensity.name() + " to " + reduced.name() + " due to low adherence");
                newIntensity = reduced;
            }
        }

        // Rule 2: Too Hard
        if (request.getDifficultyRating() >= 4) {
            adaptationDetails.add("Too Hard");
            IntensityLevel reduced = reduceIntensity(newIntensity);
            if (reduced != newIntensity) {
                changes.add("Reduced intensity from " + newIntensity.name() + " to " + reduced.name() + " because difficulty was rated too hard");
                newIntensity = reduced;
            }
            setsAdjustment--;
            changes.add("Reduced sets by 1 because difficulty was rated too hard");
        }

        // Rule 3: Too Easy
        if (request.getDifficultyRating() <= 2 && request.getSessionsCompleted() >= currentPlan.getDaysPerWeek()) {
            adaptationDetails.add("Too Easy");
            IntensityLevel increased = increaseIntensity(newIntensity);
            if (increased != newIntensity) {
                changes.add("Increased intensity from " + newIntensity.name() + " to " + increased.name() + " because workouts were too easy");
                newIntensity = increased;
            }
            setsAdjustment++;
            changes.add("Increased sets by 1 because workouts were too easy");
        }

        // Rule 4: Perfect — no changes needed (implicit)
        if (request.getSessionsCompleted() >= currentPlan.getDaysPerWeek() && request.getDifficultyRating() == 3) {
            adaptationDetails.add("Perfect Adherence");
            if (changes.isEmpty()) {
                changes.add("Perfect adherence and difficulty — no plan changes needed");
            }
        }

        // Rule 5: Goal Timeline
        List<WeeklyCheckIn> pastCheckIns = weeklyCheckInRepository.findByUserIdOrderByWeekNumberDesc(userId);
        int weeksCompleted = request.getWeekNumber();
        int goalDurationWeeks = profile.getGoalDurationWeeks();
        int weeksRemaining = goalDurationWeeks - weeksCompleted;
        if (weeksRemaining < goalDurationWeeks * 0.3 && weeksRemaining > 0) {
            // Check if behind target (simple heuristic: average adherence < 80%)
            int totalSessions = request.getSessionsCompleted();
            int totalPlanned = currentPlan.getDaysPerWeek();
            for (WeeklyCheckIn past : pastCheckIns) {
                totalSessions += past.getSessionsCompleted();
                totalPlanned += currentPlan.getDaysPerWeek();
            }
            double adherenceRate = totalPlanned > 0 ? (double) totalSessions / totalPlanned : 1.0;
            if (adherenceRate < 0.8) {
                adaptationDetails.add("Goal Timeline");
                IntensityLevel increased = increaseIntensity(newIntensity);
                if (increased != newIntensity) {
                    changes.add("Increased intensity from " + newIntensity.name() + " to " + increased.name() + " to catch up on goal timeline");
                    newIntensity = increased;
                }
            }
        }

        // Rule 6: Nutrition — weight unchanged for 2+ weeks
        if (currentNutritionPlan != null && request.getCurrentWeightKg() != null) {
            List<BigDecimal> recentWeights = new ArrayList<>();
            recentWeights.add(request.getCurrentWeightKg());
            for (WeeklyCheckIn past : pastCheckIns) {
                if (past.getCurrentWeightKg() != null) {
                    recentWeights.add(past.getCurrentWeightKg());
                }
                if (recentWeights.size() >= 3) break;
            }

            if (recentWeights.size() >= 3) {
                boolean weightUnchanged = recentWeights.get(0).compareTo(recentWeights.get(1)) == 0
                        && recentWeights.get(1).compareTo(recentWeights.get(2)) == 0;
                if (weightUnchanged) {
                    adaptationDetails.add("Nutrition Adjustment");
                    FitnessGoal goal = profile.getFitnessGoal();
                    if (goal == FitnessGoal.FAT_LOSS) {
                        calorieAdjustment = -150;
                        nutritionChanged = true;
                        changes.add("Reduced daily calories by 150 because weight has been unchanged for 2+ weeks (fat loss goal)");
                    } else if (goal == FitnessGoal.MUSCLE_GAIN) {
                        calorieAdjustment = 150;
                        nutritionChanged = true;
                        changes.add("Increased daily calories by 150 because weight has been unchanged for 2+ weeks (muscle gain goal)");
                    }
                }
            }
        }

        // Determine if workout plan changes were made
        boolean workoutChanged = newDaysPerWeek != currentPlan.getDaysPerWeek()
                || newIntensity != currentPlan.getIntensityLevel()
                || setsAdjustment != 0;

        int newVersion = currentVersion;

        if (workoutChanged) {
            // Archive old plan
            currentPlan.setStatus(PlanStatus.ARCHIVED);
            workoutPlanRepository.save(currentPlan);

            // Create new workout plan
            newVersion = currentVersion + 1;
            WorkoutPlan newPlan = new WorkoutPlan();
            newPlan.setUserId(userId);
            newPlan.setVersion(newVersion);
            newPlan.setStatus(PlanStatus.ACTIVE);
            newPlan.setIntensityLevel(newIntensity);
            newPlan.setDaysPerWeek(newDaysPerWeek);
            newPlan.setChangeSummary(String.join("; ", changes));

            // Copy workout days and exercises from current plan with adjustments
            for (WorkoutDay oldDay : currentPlan.getWorkoutDays()) {
                if (oldDay.getDayNumber() > newDaysPerWeek) {
                    continue; // Skip days beyond the new days per week
                }
                WorkoutDay newDay = new WorkoutDay();
                newDay.setWorkoutPlan(newPlan);
                newDay.setDayNumber(oldDay.getDayNumber());
                newDay.setDayLabel(oldDay.getDayLabel());
                newDay.setFocusArea(oldDay.getFocusArea());

                for (WorkoutExercise oldExercise : oldDay.getExercises()) {
                    WorkoutExercise newExercise = new WorkoutExercise();
                    newExercise.setWorkoutDay(newDay);
                    newExercise.setExerciseName(oldExercise.getExerciseName());
                    newExercise.setSets(Math.max(1, oldExercise.getSets() + setsAdjustment));
                    newExercise.setReps(oldExercise.getReps());
                    newExercise.setRestSeconds(oldExercise.getRestSeconds());
                    newExercise.setOrderIndex(oldExercise.getOrderIndex());
                    newExercise.setNotes(oldExercise.getNotes());
                    newDay.getExercises().add(newExercise);
                }

                newPlan.getWorkoutDays().add(newDay);
            }

            workoutPlanRepository.save(newPlan);
        }

        if (nutritionChanged && currentNutritionPlan != null) {
            int newNutritionVersion = currentNutritionPlan.getPlanVersion() + 1;
            NutritionPlan newNutritionPlan = new NutritionPlan();
            newNutritionPlan.setUserId(userId);
            newNutritionPlan.setPlanVersion(newNutritionVersion);
            newNutritionPlan.setDailyCalories(currentNutritionPlan.getDailyCalories() + calorieAdjustment);
            newNutritionPlan.setProteinG(currentNutritionPlan.getProteinG());
            newNutritionPlan.setCarbsG(currentNutritionPlan.getCarbsG());
            newNutritionPlan.setFatsG(currentNutritionPlan.getFatsG());
            newNutritionPlan.setDietaryTips(currentNutritionPlan.getDietaryTips());
            nutritionPlanRepository.save(newNutritionPlan);
        }

        boolean changesWereMade = workoutChanged || nutritionChanged;

        // Save the check-in record
        WeeklyCheckIn checkIn = new WeeklyCheckIn();
        checkIn.setUserId(userId);
        checkIn.setWeekNumber(request.getWeekNumber());
        checkIn.setSessionsCompleted(request.getSessionsCompleted());
        checkIn.setDifficultyRating(request.getDifficultyRating());
        checkIn.setCurrentWeightKg(request.getCurrentWeightKg());
        checkIn.setNotes(request.getNotes());
        checkIn.setPlanVersionBefore(currentVersion);
        checkIn.setPlanVersionAfter(changesWereMade ? currentVersion + 1 : currentVersion);
        weeklyCheckInRepository.save(checkIn);

        String changeSummary = changes.isEmpty()
                ? "No changes needed — keep up the good work!"
                : String.join("; ", changes);

        return new AdaptationResponse(changeSummary, changesWereMade ? currentVersion + 1 : currentVersion, changesWereMade, adaptationDetails);
    }

    private IntensityLevel reduceIntensity(IntensityLevel current) {
        return switch (current) {
            case VERY_INTENSE -> IntensityLevel.INTENSE;
            case INTENSE -> IntensityLevel.MODERATE;
            case MODERATE -> IntensityLevel.LIGHT;
            case LIGHT -> IntensityLevel.LIGHT;
        };
    }

    private IntensityLevel increaseIntensity(IntensityLevel current) {
        return switch (current) {
            case LIGHT -> IntensityLevel.MODERATE;
            case MODERATE -> IntensityLevel.INTENSE;
            case INTENSE -> IntensityLevel.VERY_INTENSE;
            case VERY_INTENSE -> IntensityLevel.VERY_INTENSE;
        };
    }
}
