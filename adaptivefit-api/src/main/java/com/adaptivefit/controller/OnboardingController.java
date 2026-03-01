package com.adaptivefit.controller;

import com.adaptivefit.dto.request.OnboardingRequest;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.OnboardingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final UserRepository userRepository;

    public OnboardingController(OnboardingService onboardingService, UserRepository userRepository) {
        this.onboardingService = onboardingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
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
    public ResponseEntity<Map<String, Boolean>> getOnboardingStatus(Authentication authentication) {
        Long userId = getUserId(authentication);
        boolean completed = onboardingService.getOnboardingStatus(userId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
