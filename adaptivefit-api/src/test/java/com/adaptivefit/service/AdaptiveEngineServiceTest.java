package com.adaptivefit.service;

import com.adaptivefit.dto.request.CheckInRequest;
import com.adaptivefit.dto.response.AdaptationResponse;
import com.adaptivefit.model.*;
import com.adaptivefit.model.enums.FitnessGoal;
import com.adaptivefit.model.enums.IntensityLevel;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdaptiveEngineServiceTest {

    @Mock
    private WeeklyCheckInRepository weeklyCheckInRepository;

    @Mock
    private WorkoutPlanRepository workoutPlanRepository;

    @Mock
    private NutritionPlanRepository nutritionPlanRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @InjectMocks
    private AdaptiveEngineService adaptiveEngineService;

    private static final Long USER_ID = 1L;

    private UserProfile defaultProfile;
    private WorkoutPlan defaultPlan;

    @BeforeEach
    void setUp() {
        defaultProfile = new UserProfile();
        defaultProfile.setUserId(USER_ID);
        defaultProfile.setFitnessGoal(FitnessGoal.GENERAL_FITNESS);
        defaultProfile.setGoalDurationWeeks(12);

        defaultPlan = createWorkoutPlan(PlanStatus.ACTIVE, IntensityLevel.MODERATE, 4, 1);
    }

    // ---- Rule 1: Adherence Drop ----

    @Test
    void rule1_lowAdherence_reducesDaysAndIntensity() {
        // sessionsCompleted < 60% of daysPerWeek (4 * 0.6 = 2.4, so 2 sessions triggers)
        CheckInRequest request = createCheckInRequest(1, 2, 3, null);

        stubCommonMocks(defaultProfile, defaultPlan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getChangeSummary().contains("Reduced training days"));
        assertTrue(response.getChangeSummary().contains("Reduced intensity"));
        assertTrue(response.getAdaptationDetails().contains("Adherence Drop"));

        // Verify old plan archived
        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        List<WorkoutPlan> savedPlans = planCaptor.getAllValues();
        assertEquals(PlanStatus.ARCHIVED, savedPlans.get(0).getStatus());

        // New plan should have reduced days and intensity
        WorkoutPlan newPlan = savedPlans.get(1);
        assertEquals(3, newPlan.getDaysPerWeek());
        assertEquals(IntensityLevel.LIGHT, newPlan.getIntensityLevel());
        assertEquals(2, newPlan.getVersion());
    }

    @Test
    void rule1_lowAdherence_doesNotReduceBelowTwoDays() {
        WorkoutPlan twoDayPlan = createWorkoutPlan(PlanStatus.ACTIVE, IntensityLevel.MODERATE, 2, 1);
        CheckInRequest request = createCheckInRequest(1, 0, 3, null);

        stubCommonMocks(defaultProfile, twoDayPlan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        // Days should stay at 2 (not reduce below), but intensity still reduces
        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(2, newPlan.getDaysPerWeek());
        assertEquals(IntensityLevel.LIGHT, newPlan.getIntensityLevel());
    }

    // ---- Rule 2: Too Hard ----

    @Test
    void rule2_difficultyRatingHigh_reducesIntensityAndSets() {
        // difficultyRating >= 4
        CheckInRequest request = createCheckInRequest(1, 4, 4, null);

        WorkoutPlan plan = createWorkoutPlanWithExercises(PlanStatus.ACTIVE, IntensityLevel.INTENSE, 4, 1, 3);
        stubCommonMocks(defaultProfile, plan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getChangeSummary().contains("Reduced intensity"));
        assertTrue(response.getChangeSummary().contains("Reduced sets by 1"));
        assertTrue(response.getAdaptationDetails().contains("Too Hard"));

        // Verify new plan exercises have sets reduced by 1
        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(IntensityLevel.MODERATE, newPlan.getIntensityLevel());
        for (WorkoutDay day : newPlan.getWorkoutDays()) {
            for (WorkoutExercise ex : day.getExercises()) {
                assertEquals(2, ex.getSets()); // 3 - 1 = 2
            }
        }
    }

    @Test
    void rule2_difficultyRating5_alsoTriggersRule() {
        CheckInRequest request = createCheckInRequest(1, 4, 5, null);

        WorkoutPlan plan = createWorkoutPlanWithExercises(PlanStatus.ACTIVE, IntensityLevel.VERY_INTENSE, 4, 1, 4);
        stubCommonMocks(defaultProfile, plan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getAdaptationDetails().contains("Too Hard"));

        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(IntensityLevel.INTENSE, newPlan.getIntensityLevel());
    }

    // ---- Rule 3: Too Easy ----

    @Test
    void rule3_tooEasyWithFullAdherence_increasesIntensityAndSets() {
        // difficultyRating <= 2 AND sessionsCompleted >= daysPerWeek
        CheckInRequest request = createCheckInRequest(1, 4, 2, null);

        WorkoutPlan plan = createWorkoutPlanWithExercises(PlanStatus.ACTIVE, IntensityLevel.MODERATE, 4, 1, 3);
        stubCommonMocks(defaultProfile, plan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getChangeSummary().contains("Increased intensity"));
        assertTrue(response.getChangeSummary().contains("Increased sets by 1"));
        assertTrue(response.getAdaptationDetails().contains("Too Easy"));

        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(IntensityLevel.INTENSE, newPlan.getIntensityLevel());
        for (WorkoutDay day : newPlan.getWorkoutDays()) {
            for (WorkoutExercise ex : day.getExercises()) {
                assertEquals(4, ex.getSets()); // 3 + 1 = 4
            }
        }
    }

    @Test
    void rule3_tooEasyWithoutFullAdherence_noChanges() {
        // difficultyRating <= 2 BUT sessionsCompleted < daysPerWeek — rule 3 should NOT fire
        // Also sessionsCompleted < 60% fires rule 1 — let's use a case where neither fires
        // sessionsCompleted = 3 with daysPerWeek=4: 3 >= 4*0.6=2.4 (no rule 1) but 3 < 4 (no rule 3)
        CheckInRequest request = createCheckInRequest(1, 3, 2, null);

        stubCommonMocks(defaultProfile, defaultPlan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertFalse(response.isChangesApplied());
        assertFalse(response.getAdaptationDetails().contains("Too Easy"));
    }

    // ---- Rule 4: Perfect adherence + difficulty 3 ----

    @Test
    void rule4_perfectAdherenceAndDifficulty_noChanges() {
        // sessionsCompleted >= daysPerWeek AND difficultyRating == 3
        CheckInRequest request = createCheckInRequest(1, 4, 3, null);

        stubCommonMocks(defaultProfile, defaultPlan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertFalse(response.isChangesApplied());
        assertTrue(response.getAdaptationDetails().contains("Perfect Adherence"));
        assertTrue(response.getChangeSummary().contains("no plan changes needed") ||
                   response.getChangeSummary().contains("No changes needed"));
    }

    // ---- Rule 5: Goal Timeline ----

    @Test
    void rule5_nearDeadlineAndBehindTarget_increasesIntensity() {
        // weeksRemaining < 30% of goalDurationWeeks AND average adherence < 80%
        // goalDurationWeeks=12, weekNumber=10, so weeksRemaining=2 which is < 12*0.3=3.6
        UserProfile profile = new UserProfile();
        profile.setUserId(USER_ID);
        profile.setFitnessGoal(FitnessGoal.GENERAL_FITNESS);
        profile.setGoalDurationWeeks(12);

        // Sessions: current=3/4, past=2/4 → total=5/8 = 62.5% < 80% (behind target)
        // sessionsCompleted=3 >= 4*0.6=2.4 so Rule 1 does NOT fire
        CheckInRequest request = createCheckInRequest(10, 3, 3, null);

        WeeklyCheckIn pastCheckIn = new WeeklyCheckIn();
        pastCheckIn.setSessionsCompleted(2);
        pastCheckIn.setWeekNumber(9);
        List<WeeklyCheckIn> pastCheckIns = List.of(pastCheckIn);

        stubCommonMocks(profile, defaultPlan, null, pastCheckIns);

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getAdaptationDetails().contains("Goal Timeline"));
        assertTrue(response.getChangeSummary().contains("catch up on goal timeline"));

        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(IntensityLevel.INTENSE, newPlan.getIntensityLevel());
    }

    // ---- Rule 6: Nutrition — weight plateau ----

    @Test
    void rule6_weightPlateauWithFatLoss_reducesCaloriesBy150() {
        UserProfile profile = new UserProfile();
        profile.setUserId(USER_ID);
        profile.setFitnessGoal(FitnessGoal.FAT_LOSS);
        profile.setGoalDurationWeeks(12);

        NutritionPlan nutritionPlan = new NutritionPlan();
        nutritionPlan.setUserId(USER_ID);
        nutritionPlan.setPlanVersion(1);
        nutritionPlan.setDailyCalories(2000);
        nutritionPlan.setProteinG(150);
        nutritionPlan.setCarbsG(200);
        nutritionPlan.setFatsG(70);

        BigDecimal weight = new BigDecimal("80.0");
        CheckInRequest request = createCheckInRequest(3, 4, 3, weight);

        // Past check-ins with same weight for 2+ weeks
        WeeklyCheckIn past1 = new WeeklyCheckIn();
        past1.setCurrentWeightKg(weight);
        past1.setSessionsCompleted(4);
        past1.setWeekNumber(2);

        WeeklyCheckIn past2 = new WeeklyCheckIn();
        past2.setCurrentWeightKg(weight);
        past2.setSessionsCompleted(4);
        past2.setWeekNumber(1);

        List<WeeklyCheckIn> pastCheckIns = List.of(past1, past2);

        stubCommonMocks(profile, defaultPlan, nutritionPlan, pastCheckIns);

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getAdaptationDetails().contains("Nutrition Adjustment"));
        assertTrue(response.getChangeSummary().contains("Reduced daily calories by 150"));

        ArgumentCaptor<NutritionPlan> nutritionCaptor = ArgumentCaptor.forClass(NutritionPlan.class);
        verify(nutritionPlanRepository).save(nutritionCaptor.capture());
        NutritionPlan savedNutrition = nutritionCaptor.getValue();
        assertEquals(1850, savedNutrition.getDailyCalories());
        assertEquals(2, savedNutrition.getPlanVersion());
    }

    @Test
    void rule6_weightPlateauWithMuscleGain_increasesCaloriesBy150() {
        UserProfile profile = new UserProfile();
        profile.setUserId(USER_ID);
        profile.setFitnessGoal(FitnessGoal.MUSCLE_GAIN);
        profile.setGoalDurationWeeks(12);

        NutritionPlan nutritionPlan = new NutritionPlan();
        nutritionPlan.setUserId(USER_ID);
        nutritionPlan.setPlanVersion(1);
        nutritionPlan.setDailyCalories(2500);
        nutritionPlan.setProteinG(180);
        nutritionPlan.setCarbsG(250);
        nutritionPlan.setFatsG(80);

        BigDecimal weight = new BigDecimal("75.0");
        CheckInRequest request = createCheckInRequest(3, 4, 3, weight);

        WeeklyCheckIn past1 = new WeeklyCheckIn();
        past1.setCurrentWeightKg(weight);
        past1.setSessionsCompleted(4);
        past1.setWeekNumber(2);

        WeeklyCheckIn past2 = new WeeklyCheckIn();
        past2.setCurrentWeightKg(weight);
        past2.setSessionsCompleted(4);
        past2.setWeekNumber(1);

        List<WeeklyCheckIn> pastCheckIns = List.of(past1, past2);

        stubCommonMocks(profile, defaultPlan, nutritionPlan, pastCheckIns);

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertTrue(response.getAdaptationDetails().contains("Nutrition Adjustment"));
        assertTrue(response.getChangeSummary().contains("Increased daily calories by 150"));

        ArgumentCaptor<NutritionPlan> nutritionCaptor = ArgumentCaptor.forClass(NutritionPlan.class);
        verify(nutritionPlanRepository).save(nutritionCaptor.capture());
        NutritionPlan savedNutrition = nutritionCaptor.getValue();
        assertEquals(2650, savedNutrition.getDailyCalories());
        assertEquals(2, savedNutrition.getPlanVersion());
    }

    // ---- Archiving and version increment ----

    @Test
    void workoutChange_archivesOldPlan_andIncrementsVersion() {
        // Trigger Rule 2 (too hard) to force a workout change
        CheckInRequest request = createCheckInRequest(1, 4, 4, null);

        WorkoutPlan plan = createWorkoutPlanWithExercises(PlanStatus.ACTIVE, IntensityLevel.INTENSE, 4, 1, 3);
        stubCommonMocks(defaultProfile, plan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertEquals(2, response.getNewPlanVersion());

        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());

        // First save: archive old plan
        WorkoutPlan archived = planCaptor.getAllValues().get(0);
        assertEquals(PlanStatus.ARCHIVED, archived.getStatus());

        // Second save: new plan with incremented version
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertEquals(PlanStatus.ACTIVE, newPlan.getStatus());
        assertEquals(2, newPlan.getVersion());
    }

    // ---- changeSummary ----

    @Test
    void changeSummary_isNotEmpty_whenChangesApplied() {
        // Trigger Rule 2 (too hard) to force changes
        CheckInRequest request = createCheckInRequest(1, 4, 4, null);

        WorkoutPlan plan = createWorkoutPlanWithExercises(PlanStatus.ACTIVE, IntensityLevel.INTENSE, 4, 1, 3);
        stubCommonMocks(defaultProfile, plan, null, Collections.emptyList());

        AdaptationResponse response = adaptiveEngineService.processCheckIn(USER_ID, request);

        assertTrue(response.isChangesApplied());
        assertNotNull(response.getChangeSummary());
        assertFalse(response.getChangeSummary().isEmpty());

        // Also verify the new plan's changeSummary field is populated
        ArgumentCaptor<WorkoutPlan> planCaptor = ArgumentCaptor.forClass(WorkoutPlan.class);
        verify(workoutPlanRepository, atLeast(2)).save(planCaptor.capture());
        WorkoutPlan newPlan = planCaptor.getAllValues().get(1);
        assertNotNull(newPlan.getChangeSummary());
        assertFalse(newPlan.getChangeSummary().isEmpty());
    }

    @Test
    void checkIn_isSaved_withCorrectVersions() {
        // Perfect adherence — no workout changes
        CheckInRequest request = createCheckInRequest(1, 4, 3, null);

        stubCommonMocks(defaultProfile, defaultPlan, null, Collections.emptyList());

        adaptiveEngineService.processCheckIn(USER_ID, request);

        ArgumentCaptor<WeeklyCheckIn> checkInCaptor = ArgumentCaptor.forClass(WeeklyCheckIn.class);
        verify(weeklyCheckInRepository).save(checkInCaptor.capture());
        WeeklyCheckIn savedCheckIn = checkInCaptor.getValue();
        assertEquals(USER_ID, savedCheckIn.getUserId());
        assertEquals(1, savedCheckIn.getWeekNumber());
        assertEquals(4, savedCheckIn.getSessionsCompleted());
        assertEquals(3, savedCheckIn.getDifficultyRating());
        assertEquals(1, savedCheckIn.getPlanVersionBefore());
        assertEquals(1, savedCheckIn.getPlanVersionAfter()); // No changes
    }

    // ---- Helper methods ----

    private CheckInRequest createCheckInRequest(int weekNumber, int sessionsCompleted,
                                                 int difficultyRating, BigDecimal weightKg) {
        CheckInRequest request = new CheckInRequest();
        request.setWeekNumber(weekNumber);
        request.setSessionsCompleted(sessionsCompleted);
        request.setDifficultyRating(difficultyRating);
        request.setCurrentWeightKg(weightKg);
        return request;
    }

    private WorkoutPlan createWorkoutPlan(PlanStatus status, IntensityLevel intensity,
                                           int daysPerWeek, int version) {
        WorkoutPlan plan = new WorkoutPlan();
        plan.setId(1L);
        plan.setUserId(USER_ID);
        plan.setStatus(status);
        plan.setIntensityLevel(intensity);
        plan.setDaysPerWeek(daysPerWeek);
        plan.setVersion(version);
        plan.setWorkoutDays(new ArrayList<>());
        return plan;
    }

    private WorkoutPlan createWorkoutPlanWithExercises(PlanStatus status, IntensityLevel intensity,
                                                        int daysPerWeek, int version, int setsPerExercise) {
        WorkoutPlan plan = createWorkoutPlan(status, intensity, daysPerWeek, version);
        for (int d = 1; d <= daysPerWeek; d++) {
            WorkoutDay day = new WorkoutDay();
            day.setWorkoutPlan(plan);
            day.setDayNumber(d);
            day.setDayLabel("Day " + d);
            day.setFocusArea("Focus " + d);
            day.setExercises(new ArrayList<>());

            WorkoutExercise exercise = new WorkoutExercise();
            exercise.setWorkoutDay(day);
            exercise.setExerciseName("Exercise " + d);
            exercise.setSets(setsPerExercise);
            exercise.setReps("10");
            exercise.setRestSeconds(60);
            exercise.setOrderIndex(1);
            day.getExercises().add(exercise);

            plan.getWorkoutDays().add(day);
        }
        return plan;
    }

    private void stubCommonMocks(UserProfile profile, WorkoutPlan plan,
                                  NutritionPlan nutritionPlan, List<WeeklyCheckIn> pastCheckIns) {
        when(userProfileRepository.findByUserId(USER_ID)).thenReturn(Optional.of(profile));
        when(workoutPlanRepository.findByUserIdAndStatus(USER_ID, PlanStatus.ACTIVE))
                .thenReturn(Optional.of(plan));
        when(nutritionPlanRepository.findFirstByUserIdOrderByPlanVersionDesc(USER_ID))
                .thenReturn(Optional.ofNullable(nutritionPlan));
        when(weeklyCheckInRepository.findByUserIdOrderByWeekNumberDesc(USER_ID))
                .thenReturn(pastCheckIns);
        lenient().when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(i -> i.getArgument(0));
        when(weeklyCheckInRepository.save(any(WeeklyCheckIn.class))).thenAnswer(i -> i.getArgument(0));
        if (nutritionPlan != null) {
            lenient().when(nutritionPlanRepository.save(any(NutritionPlan.class))).thenAnswer(i -> i.getArgument(0));
        }
    }
}
