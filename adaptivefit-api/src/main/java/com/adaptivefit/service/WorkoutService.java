package com.adaptivefit.service;

import com.adaptivefit.dto.request.WorkoutLogRequest;
import com.adaptivefit.dto.request.SubstituteExerciseRequest;
import com.adaptivefit.exception.BadRequestException;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.*;
import com.adaptivefit.model.enums.EquipmentAccess;
import com.adaptivefit.model.enums.EquipmentRequired;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutDayRepository workoutDayRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final ExerciseLogRepository exerciseLogRepository;
    private final ExerciseLibraryRepository exerciseLibraryRepository;
    private final UserProfileRepository userProfileRepository;
    private final EventLogService eventLogService;

    public WorkoutService(WorkoutPlanRepository workoutPlanRepository,
                          WorkoutDayRepository workoutDayRepository,
                          WorkoutExerciseRepository workoutExerciseRepository,
                          WorkoutLogRepository workoutLogRepository,
                          ExerciseLogRepository exerciseLogRepository,
                          ExerciseLibraryRepository exerciseLibraryRepository,
                          UserProfileRepository userProfileRepository,
                          EventLogService eventLogService) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.workoutDayRepository = workoutDayRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.exerciseLogRepository = exerciseLogRepository;
        this.exerciseLibraryRepository = exerciseLibraryRepository;
        this.userProfileRepository = userProfileRepository;
        this.eventLogService = eventLogService;
    }

    public Map<String, Object> getWeeklySchedule(Long userId) {
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<WorkoutLog> weekLogs = workoutLogRepository.findByUserIdAndCompletedAtBetween(userId, monday, sunday);
        Set<Long> completedDayIds = weekLogs.stream()
                .map(WorkoutLog::getWorkoutDayId)
                .collect(Collectors.toSet());

        List<WorkoutDay> days = workoutDayRepository.findByWorkoutPlanId(plan.getId());

        List<Map<String, Object>> daySchedules = new ArrayList<>();
        for (WorkoutDay day : days) {
            Map<String, Object> dayMap = new LinkedHashMap<>();
            dayMap.put("dayId", day.getId());
            dayMap.put("dayNumber", day.getDayNumber());
            dayMap.put("dayLabel", day.getDayLabel());
            dayMap.put("focusArea", day.getFocusArea());
            dayMap.put("exerciseCount", workoutExerciseRepository.findByWorkoutDayId(day.getId()).size());
            dayMap.put("completed", completedDayIds.contains(day.getId()));
            daySchedules.add(dayMap);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("planId", plan.getId());
        result.put("version", plan.getVersion());
        result.put("daysPerWeek", plan.getDaysPerWeek());
        result.put("weekStart", monday.toString());
        result.put("weekEnd", sunday.toString());
        result.put("days", daySchedules);
        return result;
    }

    public Map<String, Object> getDayDetail(Long userId, Long dayId) {
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        WorkoutDay day = workoutDayRepository.findById(dayId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));

        if (!day.getWorkoutPlan().getId().equals(plan.getId())) {
            throw new ResourceNotFoundException("Workout day not found");
        }

        List<WorkoutExercise> exercises = workoutExerciseRepository.findByWorkoutDayId(dayId);

        List<Map<String, Object>> exerciseList = new ArrayList<>();
        for (WorkoutExercise exercise : exercises) {
            Map<String, Object> exMap = new LinkedHashMap<>();
            exMap.put("exerciseId", exercise.getId());
            exMap.put("exerciseName", exercise.getExerciseName());
            exMap.put("sets", exercise.getSets());
            exMap.put("reps", exercise.getReps());
            exMap.put("restSeconds", exercise.getRestSeconds());
            exMap.put("orderIndex", exercise.getOrderIndex());
            exMap.put("notes", exercise.getNotes());
            exerciseList.add(exMap);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("dayId", day.getId());
        result.put("dayNumber", day.getDayNumber());
        result.put("dayLabel", day.getDayLabel());
        result.put("focusArea", day.getFocusArea());
        result.put("exercises", exerciseList);
        return result;
    }

    @Transactional
    public Map<String, Object> completeWorkout(Long userId, WorkoutLogRequest request) {
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        WorkoutDay day = workoutDayRepository.findById(request.getDayId())
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found"));

        if (!day.getWorkoutPlan().getId().equals(plan.getId())) {
            throw new ResourceNotFoundException("Workout day not found");
        }

        WorkoutLog workoutLog = new WorkoutLog();
        workoutLog.setUserId(userId);
        workoutLog.setWorkoutDayId(request.getDayId());
        workoutLog.setCompletedAt(LocalDate.now());
        workoutLog.setMarkedComplete(true);
        workoutLog = workoutLogRepository.save(workoutLog);

        if (request.getExerciseLogs() != null) {
            for (WorkoutLogRequest.ExerciseLogEntry entry : request.getExerciseLogs()) {
                ExerciseLog exerciseLog = new ExerciseLog();
                exerciseLog.setWorkoutLogId(workoutLog.getId());
                exerciseLog.setExerciseId(entry.getExerciseId());
                exerciseLog.setActualSets(entry.getActualSets());
                exerciseLog.setActualReps(entry.getActualReps());
                exerciseLog.setActualWeightKg(entry.getActualWeightKg());
                exerciseLogRepository.save(exerciseLog);
            }
        }

        eventLogService.logEvent(userId, "WORKOUT_COMPLETED",
                "{\"dayId\":" + request.getDayId() + ",\"dayLabel\":\"" + day.getDayLabel() + "\"}");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Workout completed successfully");
        result.put("workoutLogId", workoutLog.getId());
        result.put("dayLabel", day.getDayLabel());
        result.put("completedAt", workoutLog.getCompletedAt().toString());
        return result;
    }

    @Transactional
    public Map<String, Object> substituteExercise(Long userId, SubstituteExerciseRequest request) {
        WorkoutPlan plan = workoutPlanRepository.findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active workout plan found"));

        WorkoutExercise exercise = workoutExerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("Exercise not found in your plan"));

        if (!exercise.getWorkoutDay().getWorkoutPlan().getId().equals(plan.getId())) {
            throw new ResourceNotFoundException("Exercise not found in your plan");
        }

        ExerciseLibrary newExercise = exerciseLibraryRepository.findById(request.getNewExerciseId())
                .orElseThrow(() -> new ResourceNotFoundException("New exercise not found in exercise library"));

        // Verify same muscle group
        String currentMuscleGroup = findMuscleGroupForExercise(exercise.getExerciseName());
        if (currentMuscleGroup != null && !currentMuscleGroup.equals(newExercise.getMuscleGroup())) {
            throw new BadRequestException("Substitute exercise must target the same muscle group");
        }

        // Verify compatible equipment
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(null);
        if (profile != null) {
            List<EquipmentRequired> allowed = getAllowedEquipment(profile.getEquipmentAccess());
            if (!allowed.contains(newExercise.getEquipmentRequired())) {
                throw new BadRequestException("Substitute exercise requires equipment you don't have access to");
            }
        }

        String oldName = exercise.getExerciseName();
        exercise.setExerciseName(newExercise.getName());
        workoutExerciseRepository.save(exercise);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Exercise substituted successfully");
        result.put("oldExercise", oldName);
        result.put("newExercise", newExercise.getName());
        result.put("muscleGroup", newExercise.getMuscleGroup());
        return result;
    }

    private String findMuscleGroupForExercise(String exerciseName) {
        List<ExerciseLibrary> matches = exerciseLibraryRepository.findAll().stream()
                .filter(e -> e.getName().equals(exerciseName))
                .toList();
        return matches.isEmpty() ? null : matches.get(0).getMuscleGroup();
    }

    private List<EquipmentRequired> getAllowedEquipment(EquipmentAccess access) {
        return switch (access) {
            case BODYWEIGHT_ONLY -> List.of(EquipmentRequired.NONE);
            case HOME_BASIC -> List.of(EquipmentRequired.NONE, EquipmentRequired.DUMBBELLS);
            case FULL_GYM -> List.of(EquipmentRequired.NONE, EquipmentRequired.DUMBBELLS,
                    EquipmentRequired.BARBELL, EquipmentRequired.CABLE_MACHINE, EquipmentRequired.FULL_GYM);
        };
    }
}
