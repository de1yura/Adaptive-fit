package com.adaptivefit.controller;

import com.adaptivefit.dto.request.OnboardingRequest;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.model.UserProfile;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.repository.UserProfileRepository;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.OnboardingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
@Tag(name = "Onboarding", description = "User onboarding and profile management")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    public OnboardingController(OnboardingService onboardingService, UserRepository userRepository,
                                UserProfileRepository userProfileRepository) {
        this.onboardingService = onboardingService;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit onboarding", description = "Submits the user's onboarding profile and generates an initial workout plan")
    public ResponseEntity<Map<String, Object>> submitOnboarding(
            @Valid @RequestBody OnboardingRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        WorkoutPlan workoutPlan = onboardingService.submitOnboarding(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Onboarding completed successfully",
                "workoutDays", workoutPlan.getWorkoutDays().size(),
                "daysPerWeek", workoutPlan.getDaysPerWeek()
        ));
    }

    @GetMapping("/status")
    @Operation(summary = "Get onboarding status", description = "Returns whether the user has completed onboarding")
    public ResponseEntity<Map<String, Boolean>> getOnboardingStatus(Authentication authentication) {
        Long userId = getUserId(authentication);
        boolean completed = onboardingService.getOnboardingStatus(userId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Returns the authenticated user's profile settings")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        Long userId = getUserId(authentication);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fitnessGoal", profile.getFitnessGoal());
        data.put("experienceLevel", profile.getExperienceLevel());
        data.put("daysPerWeek", profile.getDaysPerWeek());
        data.put("sessionDurationMinutes", profile.getSessionDurationMinutes());
        data.put("equipmentAccess", profile.getEquipmentAccess());
        data.put("dietaryPreference", profile.getDietaryPreference());
        data.put("heightCm", profile.getHeightCm());
        data.put("weightKg", profile.getWeightKg());
        data.put("age", profile.getAge());
        data.put("goalDurationWeeks", profile.getGoalDurationWeeks());

        return ResponseEntity.ok(data);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Updates the authenticated user's profile settings")
    public ResponseEntity<Map<String, String>> updateProfile(
            @Valid @RequestBody OnboardingRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

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
        userProfileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
