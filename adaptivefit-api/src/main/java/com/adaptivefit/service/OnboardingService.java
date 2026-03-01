package com.adaptivefit.service;

import com.adaptivefit.dto.request.OnboardingRequest;
import com.adaptivefit.exception.BadRequestException;
import com.adaptivefit.model.NutritionPlan;
import com.adaptivefit.model.UserProfile;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.repository.NutritionPlanRepository;
import com.adaptivefit.repository.UserProfileRepository;
import com.adaptivefit.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OnboardingService {

    private final UserProfileRepository userProfileRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final PlanGeneratorService planGeneratorService;

    public OnboardingService(UserProfileRepository userProfileRepository,
                             WorkoutPlanRepository workoutPlanRepository,
                             NutritionPlanRepository nutritionPlanRepository,
                             PlanGeneratorService planGeneratorService) {
        this.userProfileRepository = userProfileRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.nutritionPlanRepository = nutritionPlanRepository;
        this.planGeneratorService = planGeneratorService;
    }

    @Transactional
    public WorkoutPlan submitOnboarding(Long userId, OnboardingRequest request) {
        if (userProfileRepository.findByUserId(userId).isPresent()) {
            throw new BadRequestException("Onboarding already completed");
        }

        UserProfile profile = new UserProfile();
        profile.setUserId(userId);
        profile.setFitnessGoal(request.getFitnessGoal());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setDaysPerWeek(request.getDaysPerWeek());
        profile.setSessionDurationMinutes(request.getSessionDurationMinutes());
        profile.setEquipmentAccess(request.getEquipmentAccess());
        profile.setDietaryPreference(request.getDietaryPreference());
        profile.setHeightCm(request.getHeightCm());
        profile.setWeightKg(request.getWeightKg());
        profile.setAge(request.getAge());
        profile.setGoalDurationWeeks(request.getGoalDurationWeeks());
        profile.setOnboardingCompleted(true);
        userProfileRepository.save(profile);

        WorkoutPlan workoutPlan = planGeneratorService.generateWorkoutPlan(profile);
        workoutPlanRepository.save(workoutPlan);

        NutritionPlan nutritionPlan = planGeneratorService.generateNutritionPlan(profile);
        nutritionPlanRepository.save(nutritionPlan);

        return workoutPlan;
    }

    public boolean getOnboardingStatus(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .map(UserProfile::isOnboardingCompleted)
                .orElse(false);
    }
}
