package com.adaptivefit.controller;

import com.adaptivefit.dto.response.WorkoutPlanResponse;
import com.adaptivefit.exception.BadRequestException;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.model.WorkoutDay;
import com.adaptivefit.model.WorkoutExercise;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.repository.WorkoutPlanRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/plans")
@Tag(name = "Workout Plans", description = "View and manage workout plans")
public class WorkoutPlanController {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    public WorkoutPlanController(WorkoutPlanRepository workoutPlanRepository, UserRepository userRepository) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/current")
    @Operation(summary = "Get current plan", description = "Returns the user's currently active workout plan")
    public ResponseEntity<WorkoutPlanResponse> getCurrentPlan(Authentication authentication) {
        Long userId = getUserId(authentication);
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));
        return ResponseEntity.ok(WorkoutPlanResponse.fromEntity(plan));
    }

    @GetMapping("/history")
    @Operation(summary = "Get plan history", description = "Returns all workout plan versions ordered by version descending")
    public ResponseEntity<List<WorkoutPlanResponse>> getPlanHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<WorkoutPlan> plans = workoutPlanRepository.findByUserIdOrderByVersionDesc(userId);
        List<WorkoutPlanResponse> responses = plans.stream()
                .map(WorkoutPlanResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{planId}")
    @Operation(summary = "Get plan by ID", description = "Returns a specific workout plan by its ID")
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

    @PatchMapping("/routine")
    @Transactional
    @Operation(summary = "Update workout routine", description = "Replaces all workout days and exercises for the active plan")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> updateRoutine(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        Object routineObj = body.get("workoutRoutine");
        if (!(routineObj instanceof List)) {
            throw new BadRequestException("workoutRoutine must be an array");
        }

        List<Map<String, Object>> routine = (List<Map<String, Object>>) routineObj;

        // Clear existing days (cascade will remove exercises)
        plan.getWorkoutDays().clear();

        // Create new days and exercises from the routine
        for (Map<String, Object> dayData : routine) {
            WorkoutDay day = new WorkoutDay();
            day.setWorkoutPlan(plan);
            day.setDayNumber(toInt(dayData.get("day")));
            day.setDayLabel((String) dayData.getOrDefault("title", "Day " + dayData.get("day")));
            day.setFocusArea((String) dayData.getOrDefault("splitType", ""));

            List<Map<String, Object>> exerciseList = (List<Map<String, Object>>) dayData.getOrDefault("exercises", Collections.emptyList());
            int orderIndex = 0;
            for (Map<String, Object> exData : exerciseList) {
                WorkoutExercise exercise = new WorkoutExercise();
                exercise.setWorkoutDay(day);
                exercise.setExerciseName((String) exData.get("name"));
                exercise.setSets(toInt(exData.getOrDefault("sets", 3)));
                exercise.setReps(String.valueOf(exData.getOrDefault("reps", "10")));
                exercise.setRestSeconds(toInt(exData.getOrDefault("restSeconds", 60)));
                exercise.setOrderIndex(orderIndex++);
                exercise.setNotes((String) exData.getOrDefault("notes", null));
                day.getExercises().add(exercise);
            }

            plan.getWorkoutDays().add(day);
        }

        plan.setDaysPerWeek(routine.size());
        workoutPlanRepository.save(plan);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Workout routine updated successfully");
        response.put("daysUpdated", routine.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/presets")
    @Operation(summary = "Get workout presets", description = "Returns available workout split presets")
    public ResponseEntity<List<Map<String, Object>>> getPresets() {
        List<Map<String, Object>> presets = List.of(
                Map.of("key", "ppl", "name", "Push / Pull / Legs", "description", "Classic 3-day split", "days", 3),
                Map.of("key", "upper_lower", "name", "Upper / Lower", "description", "4-day upper lower split", "days", 4),
                Map.of("key", "full_body", "name", "Full Body", "description", "3 full body sessions", "days", 3),
                Map.of("key", "bro_split", "name", "Bro Split", "description", "5-day bodypart split", "days", 5)
        );

        return ResponseEntity.ok(presets);
    }

    @PostMapping("/from-preset")
    @Operation(summary = "Generate plan from preset", description = "Generates a workout routine based on a preset key")
    public ResponseEntity<Map<String, Object>> generateFromPreset(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        // Validate user is authenticated
        getUserId(authentication);

        String presetKey = body.get("presetKey");
        String equipment = body.getOrDefault("equipment", "gym");
        String goal = body.getOrDefault("goal", "general");

        if (presetKey == null) {
            throw new BadRequestException("presetKey is required");
        }

        List<Map<String, Object>> workoutRoutine = generatePresetRoutine(presetKey, equipment, goal);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("presetKey", presetKey);
        response.put("equipment", equipment);
        response.put("goal", goal);
        response.put("workoutRoutine", workoutRoutine);

        return ResponseEntity.ok(response);
    }

    private List<Map<String, Object>> generatePresetRoutine(String presetKey, String equipment, String goal) {
        return switch (presetKey) {
            case "ppl" -> List.of(
                    buildDay(1, "Push", "push", List.of(
                            buildExercise("Bench Press", "Chest", 4, 8),
                            buildExercise("Overhead Press", "Shoulders", 3, 10),
                            buildExercise("Incline Dumbbell Press", "Chest", 3, 10),
                            buildExercise("Lateral Raises", "Shoulders", 3, 15),
                            buildExercise("Tricep Pushdowns", "Triceps", 3, 12)
                    )),
                    buildDay(2, "Pull", "pull", List.of(
                            buildExercise("Barbell Rows", "Back", 4, 8),
                            buildExercise("Pull-Ups", "Back", 3, 8),
                            buildExercise("Face Pulls", "Rear Delts", 3, 15),
                            buildExercise("Barbell Curls", "Biceps", 3, 10),
                            buildExercise("Hammer Curls", "Biceps", 3, 12)
                    )),
                    buildDay(3, "Legs", "legs", List.of(
                            buildExercise("Squats", "Quadriceps", 4, 8),
                            buildExercise("Romanian Deadlifts", "Hamstrings", 3, 10),
                            buildExercise("Leg Press", "Quadriceps", 3, 12),
                            buildExercise("Leg Curls", "Hamstrings", 3, 12),
                            buildExercise("Calf Raises", "Calves", 4, 15)
                    ))
            );
            case "upper_lower" -> List.of(
                    buildDay(1, "Upper A", "upper", List.of(
                            buildExercise("Bench Press", "Chest", 4, 8),
                            buildExercise("Barbell Rows", "Back", 4, 8),
                            buildExercise("Overhead Press", "Shoulders", 3, 10),
                            buildExercise("Pull-Ups", "Back", 3, 8),
                            buildExercise("Bicep Curls", "Biceps", 3, 12)
                    )),
                    buildDay(2, "Lower A", "lower", List.of(
                            buildExercise("Squats", "Quadriceps", 4, 8),
                            buildExercise("Romanian Deadlifts", "Hamstrings", 3, 10),
                            buildExercise("Leg Press", "Quadriceps", 3, 12),
                            buildExercise("Leg Curls", "Hamstrings", 3, 12),
                            buildExercise("Calf Raises", "Calves", 4, 15)
                    )),
                    buildDay(3, "Upper B", "upper", List.of(
                            buildExercise("Incline Dumbbell Press", "Chest", 4, 10),
                            buildExercise("Cable Rows", "Back", 4, 10),
                            buildExercise("Lateral Raises", "Shoulders", 3, 15),
                            buildExercise("Face Pulls", "Rear Delts", 3, 15),
                            buildExercise("Tricep Dips", "Triceps", 3, 10)
                    )),
                    buildDay(4, "Lower B", "lower", List.of(
                            buildExercise("Front Squats", "Quadriceps", 4, 8),
                            buildExercise("Hip Thrusts", "Glutes", 3, 10),
                            buildExercise("Walking Lunges", "Quadriceps", 3, 12),
                            buildExercise("Leg Curls", "Hamstrings", 3, 12),
                            buildExercise("Calf Raises", "Calves", 4, 15)
                    ))
            );
            case "full_body" -> List.of(
                    buildDay(1, "Full Body A", "full_body", List.of(
                            buildExercise("Squats", "Quadriceps", 4, 8),
                            buildExercise("Bench Press", "Chest", 4, 8),
                            buildExercise("Barbell Rows", "Back", 3, 10),
                            buildExercise("Overhead Press", "Shoulders", 3, 10),
                            buildExercise("Plank", "Core", 3, 60)
                    )),
                    buildDay(2, "Full Body B", "full_body", List.of(
                            buildExercise("Deadlifts", "Back", 4, 6),
                            buildExercise("Incline Dumbbell Press", "Chest", 3, 10),
                            buildExercise("Pull-Ups", "Back", 3, 8),
                            buildExercise("Lunges", "Quadriceps", 3, 12),
                            buildExercise("Bicep Curls", "Biceps", 3, 12)
                    )),
                    buildDay(3, "Full Body C", "full_body", List.of(
                            buildExercise("Front Squats", "Quadriceps", 4, 8),
                            buildExercise("Dumbbell Press", "Chest", 3, 10),
                            buildExercise("Cable Rows", "Back", 3, 10),
                            buildExercise("Lateral Raises", "Shoulders", 3, 15),
                            buildExercise("Tricep Pushdowns", "Triceps", 3, 12)
                    ))
            );
            case "bro_split" -> List.of(
                    buildDay(1, "Chest", "chest", List.of(
                            buildExercise("Bench Press", "Chest", 4, 8),
                            buildExercise("Incline Dumbbell Press", "Chest", 3, 10),
                            buildExercise("Cable Flyes", "Chest", 3, 12),
                            buildExercise("Dips", "Chest", 3, 10)
                    )),
                    buildDay(2, "Back", "back", List.of(
                            buildExercise("Deadlifts", "Back", 4, 6),
                            buildExercise("Barbell Rows", "Back", 4, 8),
                            buildExercise("Lat Pulldowns", "Back", 3, 10),
                            buildExercise("Face Pulls", "Rear Delts", 3, 15)
                    )),
                    buildDay(3, "Shoulders", "shoulders", List.of(
                            buildExercise("Overhead Press", "Shoulders", 4, 8),
                            buildExercise("Lateral Raises", "Shoulders", 4, 15),
                            buildExercise("Front Raises", "Shoulders", 3, 12),
                            buildExercise("Reverse Flyes", "Rear Delts", 3, 15)
                    )),
                    buildDay(4, "Legs", "legs", List.of(
                            buildExercise("Squats", "Quadriceps", 4, 8),
                            buildExercise("Romanian Deadlifts", "Hamstrings", 3, 10),
                            buildExercise("Leg Press", "Quadriceps", 3, 12),
                            buildExercise("Leg Curls", "Hamstrings", 3, 12),
                            buildExercise("Calf Raises", "Calves", 4, 15)
                    )),
                    buildDay(5, "Arms", "arms", List.of(
                            buildExercise("Barbell Curls", "Biceps", 4, 10),
                            buildExercise("Skull Crushers", "Triceps", 4, 10),
                            buildExercise("Hammer Curls", "Biceps", 3, 12),
                            buildExercise("Tricep Pushdowns", "Triceps", 3, 12),
                            buildExercise("Wrist Curls", "Forearms", 3, 15)
                    ))
            );
            default -> throw new BadRequestException("Unknown preset key: " + presetKey);
        };
    }

    private Map<String, Object> buildDay(int day, String title, String splitType, List<Map<String, Object>> exercises) {
        Map<String, Object> dayMap = new LinkedHashMap<>();
        dayMap.put("day", day);
        dayMap.put("title", title);
        dayMap.put("splitType", splitType);
        dayMap.put("exercises", exercises);
        return dayMap;
    }

    private Map<String, Object> buildExercise(String name, String muscleGroup, int sets, int reps) {
        Map<String, Object> exercise = new LinkedHashMap<>();
        exercise.put("name", name);
        exercise.put("muscleGroup", muscleGroup);
        exercise.put("sets", sets);
        exercise.put("reps", reps);
        return exercise;
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    private int toInt(Object value) {
        if (value instanceof Integer) {
            return (Integer) value;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }
}
