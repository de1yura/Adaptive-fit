package com.adaptivefit.controller;

import com.adaptivefit.dto.request.SubstituteExerciseRequest;
import com.adaptivefit.dto.request.WorkoutLogRequest;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.WorkoutService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserRepository userRepository;

    public WorkoutController(WorkoutService workoutService, UserRepository userRepository) {
        this.workoutService = workoutService;
        this.userRepository = userRepository;
    }

    @GetMapping("/week")
    public ResponseEntity<Map<String, Object>> getWeeklySchedule(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.getWeeklySchedule(userId));
    }

    @GetMapping("/day/{dayId}")
    public ResponseEntity<Map<String, Object>> getDayDetail(
            @PathVariable Long dayId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.getDayDetail(userId, dayId));
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> completeWorkout(
            @Valid @RequestBody WorkoutLogRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(workoutService.completeWorkout(userId, request));
    }

    @PutMapping("/substitute")
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
