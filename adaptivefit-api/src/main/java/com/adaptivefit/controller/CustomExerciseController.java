package com.adaptivefit.controller;

import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.CustomExercise;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.CustomExerciseRepository;
import com.adaptivefit.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exercises/custom")
@Tag(name = "Custom Exercises", description = "Manage user-defined custom exercises")
public class CustomExerciseController {

    private final CustomExerciseRepository customExerciseRepository;
    private final UserRepository userRepository;

    public CustomExerciseController(CustomExerciseRepository customExerciseRepository,
                                    UserRepository userRepository) {
        this.customExerciseRepository = customExerciseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "List custom exercises", description = "Returns all custom exercises for the authenticated user")
    public ResponseEntity<List<CustomExercise>> listCustomExercises(Authentication authentication) {
        User user = getUser(authentication);
        List<CustomExercise> exercises = customExerciseRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(exercises);
    }

    @PostMapping
    @Operation(summary = "Create custom exercise", description = "Creates a new custom exercise for the authenticated user")
    public ResponseEntity<CustomExercise> createCustomExercise(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        User user = getUser(authentication);

        CustomExercise exercise = new CustomExercise();
        exercise.setUser(user);
        exercise.setName(body.get("name"));
        exercise.setMuscleGroup(body.get("muscleGroup"));
        if (body.containsKey("equipment")) {
            exercise.setEquipment(body.get("equipment"));
        }

        CustomExercise saved = customExerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "Delete custom exercise", description = "Deletes a custom exercise owned by the authenticated user")
    public ResponseEntity<Map<String, String>> deleteCustomExercise(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUser(authentication);
        CustomExercise exercise = customExerciseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Custom exercise not found"));

        if (!exercise.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Custom exercise not found");
        }

        customExerciseRepository.delete(exercise);
        return ResponseEntity.ok(Map.of("message", "Custom exercise deleted successfully"));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
