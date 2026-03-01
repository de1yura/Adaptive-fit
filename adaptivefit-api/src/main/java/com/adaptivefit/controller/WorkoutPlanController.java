package com.adaptivefit.controller;

import com.adaptivefit.dto.response.WorkoutPlanResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.repository.WorkoutPlanRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class WorkoutPlanController {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    public WorkoutPlanController(WorkoutPlanRepository workoutPlanRepository, UserRepository userRepository) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/current")
    public ResponseEntity<WorkoutPlanResponse> getCurrentPlan(Authentication authentication) {
        Long userId = getUserId(authentication);
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));
        return ResponseEntity.ok(WorkoutPlanResponse.fromEntity(plan));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WorkoutPlanResponse>> getPlanHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<WorkoutPlan> plans = workoutPlanRepository.findByUserIdOrderByVersionDesc(userId);
        List<WorkoutPlanResponse> responses = plans.stream()
                .map(WorkoutPlanResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{planId}")
    public ResponseEntity<WorkoutPlanResponse> getPlanById(
            @PathVariable Long planId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        WorkoutPlan plan = workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found"));
        if (!plan.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Workout plan not found");
        }
        return ResponseEntity.ok(WorkoutPlanResponse.fromEntity(plan));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
