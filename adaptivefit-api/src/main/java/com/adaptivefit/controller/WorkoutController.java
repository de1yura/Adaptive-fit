package com.adaptivefit.controller;

import com.adaptivefit.dto.request.SubstituteExerciseRequest;
import com.adaptivefit.dto.request.WorkoutLogRequest;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.WorkoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@Tag(name = "Workouts", description = "Workout scheduling, logging, and exercise substitution")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserRepository userRepository;

    public WorkoutController(WorkoutService workoutService, UserRepository userRepository) {
        this.workoutService = workoutService;
        this.userRepository = userRepository;
    }

    @GetMapping("/week")
    @Operation(summary = "Get weekly schedule", description = "Returns the current week's workout schedule with day details")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.getWeeklySchedule(userId));
    }

    @GetMapping("/day/{dayId}")
    @Operation(summary = "Get day detail", description = "Returns detailed exercises for a specific workout day")
    public ResponseEntity<Map<String, Object>> getDayDetail(
            @PathVariable Long dayId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.getDayDetail(userId, dayId));
    }

    @PostMapping("/complete")
    @Operation(summary = "Complete workout", description = "Logs a completed workout session with exercise details")
    public ResponseEntity<Map<String, Object>> completeWorkout(
            @Valid @RequestBody WorkoutLogRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.completeWorkout(userId, request));
    }

    @GetMapping("/exercises/{exerciseId}/alternatives")
    @Operation(summary = "Get alternative exercises", description = "Returns alternative exercises for the same muscle group")
    public ResponseEntity<List<Map<String, Object>>> getAlternativeExercises(
            @PathVariable Long exerciseId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.getAlternativeExercises(userId, exerciseId));
    }

    @PutMapping("/substitute")
    @Operation(summary = "Substitute exercise", description = "Replaces an exercise in the workout plan with an alternative")
    public ResponseEntity<Map<String, Object>> substituteExercise(
            @Valid @RequestBody SubstituteExerciseRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.substituteExercise(userId, request));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
