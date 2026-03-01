package com.adaptivefit.service;

import com.adaptivefit.model.*;
import com.adaptivefit.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataExportService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final NutritionLogRepository nutritionLogRepository;
    private final WeeklyCheckInRepository weeklyCheckInRepository;

    public DataExportService(UserRepository userRepository,
                             UserProfileRepository userProfileRepository,
                             WorkoutPlanRepository workoutPlanRepository,
                             WorkoutLogRepository workoutLogRepository,
                             NutritionPlanRepository nutritionPlanRepository,
                             NutritionLogRepository nutritionLogRepository,
                             WeeklyCheckInRepository weeklyCheckInRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.nutritionPlanRepository = nutritionPlanRepository;
        this.nutritionLogRepository = nutritionLogRepository;
        this.weeklyCheckInRepository = weeklyCheckInRepository;
    }

    public Map<String, Object> exportUserData(Long userId) {
        String anonymousId = "user_" + UUID.nameUUIDFromBytes(userId.toString().getBytes()).toString().substring(0, 8);
        return buildAnonymisedUserData(userId, anonymousId);
    }

    public List<Map<String, Object>> exportAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(user -> {
                    String anonymousId = "user_" + UUID.nameUUIDFromBytes(user.getId().toString().getBytes()).toString().substring(0, 8);
                    return buildAnonymisedUserData(user.getId(), anonymousId);
                })
                .collect(Collectors.toList());
    }

    private Map<String, Object> buildAnonymisedUserData(Long userId, String anonymousId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("anonymousId", anonymousId);

        // Profile (anonymised - no email/name)
        userProfileRepository.findByUserId(userId).ifPresent(profile -> {
            Map<String, Object> profileData = new LinkedHashMap<>();
            profileData.put("fitnessGoal", profile.getFitnessGoal());
            profileData.put("experienceLevel", profile.getExperienceLevel());
            profileData.put("daysPerWeek", profile.getDaysPerWeek());
            profileData.put("sessionDurationMinutes", profile.getSessionDurationMinutes());
            profileData.put("equipmentAccess", profile.getEquipmentAccess());
            profileData.put("dietaryPreference", profile.getDietaryPreference());
            profileData.put("heightCm", profile.getHeightCm());
            profileData.put("weightKg", profile.getWeightKg());
            profileData.put("age", profile.getAge());
            profileData.put("goalDurationWeeks", profile.getGoalDurationWeeks());
            data.put("profile", profileData);
        });

        // Plan versions
        List<WorkoutPlan> plans = workoutPlanRepository.findByUserIdOrderByVersionDesc(userId);
        List<Map<String, Object>> planVersions = plans.stream().map(plan -> {
            Map<String, Object> planData = new LinkedHashMap<>();
            planData.put("version", plan.getVersion());
            planData.put("status", plan.getStatus());
            planData.put("intensityLevel", plan.getIntensityLevel());
            planData.put("daysPerWeek", plan.getDaysPerWeek());
            planData.put("createdAt", plan.getCreatedAt());
            planData.put("changeSummary", plan.getChangeSummary());
            return planData;
        }).collect(Collectors.toList());
        data.put("workoutPlanVersions", planVersions);

        // Check-ins
        List<WeeklyCheckIn> checkIns = weeklyCheckInRepository.findByUserIdOrderByWeekNumberDesc(userId);
        List<Map<String, Object>> checkInData = checkIns.stream().map(ci -> {
            Map<String, Object> ciMap = new LinkedHashMap<>();
            ciMap.put("weekNumber", ci.getWeekNumber());
            ciMap.put("sessionsCompleted", ci.getSessionsCompleted());
            ciMap.put("difficultyRating", ci.getDifficultyRating());
            ciMap.put("currentWeightKg", ci.getCurrentWeightKg());
            ciMap.put("planVersionBefore", ci.getPlanVersionBefore());
            ciMap.put("planVersionAfter", ci.getPlanVersionAfter());
            ciMap.put("submittedAt", ci.getSubmittedAt());
            return ciMap;
        }).collect(Collectors.toList());
        data.put("checkIns", checkInData);

        // Workout logs
        List<WorkoutLog> workoutLogs = workoutLogRepository.findByUserId(userId);
        List<Map<String, Object>> workoutLogData = workoutLogs.stream().map(wl -> {
            Map<String, Object> wlMap = new LinkedHashMap<>();
            wlMap.put("workoutDayId", wl.getWorkoutDayId());
            wlMap.put("completedAt", wl.getCompletedAt());
            wlMap.put("markedComplete", wl.isMarkedComplete());
            return wlMap;
        }).collect(Collectors.toList());
        data.put("workoutLogs", workoutLogData);

        // Nutrition plans
        List<NutritionPlan> nutritionPlans = nutritionPlanRepository.findByUserIdOrderByPlanVersionDesc(userId);
        List<Map<String, Object>> nutritionPlanData = nutritionPlans.stream().map(np -> {
            Map<String, Object> npMap = new LinkedHashMap<>();
            npMap.put("planVersion", np.getPlanVersion());
            npMap.put("dailyCalories", np.getDailyCalories());
            npMap.put("proteinG", np.getProteinG());
            npMap.put("carbsG", np.getCarbsG());
            npMap.put("fatsG", np.getFatsG());
            npMap.put("createdAt", np.getCreatedAt());
            return npMap;
        }).collect(Collectors.toList());
        data.put("nutritionPlans", nutritionPlanData);

        // Nutrition logs
        List<NutritionLog> nutritionLogs = nutritionLogRepository.findByUserIdOrderByLogDateDesc(userId);
        List<Map<String, Object>> nutritionLogData = nutritionLogs.stream().map(nl -> {
            Map<String, Object> nlMap = new LinkedHashMap<>();
            nlMap.put("logDate", nl.getLogDate());
            nlMap.put("caloriesConsumed", nl.getCaloriesConsumed());
            nlMap.put("proteinG", nl.getProteinG());
            nlMap.put("carbsG", nl.getCarbsG());
            nlMap.put("fatsG", nl.getFatsG());
            return nlMap;
        }).collect(Collectors.toList());
        data.put("nutritionLogs", nutritionLogData);

        return data;
    }
}
