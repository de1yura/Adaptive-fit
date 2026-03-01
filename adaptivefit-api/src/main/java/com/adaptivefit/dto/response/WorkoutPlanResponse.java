package com.adaptivefit.dto.response;

import com.adaptivefit.model.WorkoutDay;
import com.adaptivefit.model.WorkoutExercise;
import com.adaptivefit.model.WorkoutPlan;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class WorkoutPlanResponse {

    private Long id;
    private int version;
    private String status;
    private String intensityLevel;
    private int daysPerWeek;
    private LocalDateTime createdAt;
    private String changeSummary;
    private List<DayResponse> days;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class DayResponse {
        private Long id;
        private int dayNumber;
        private String dayLabel;
        private String focusArea;
        private List<ExerciseResponse> exercises;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class ExerciseResponse {
        private Long id;
        private String exerciseName;
        private int sets;
        private String reps;
        private int restSeconds;
        private int orderIndex;
        private String notes;
    }

    public static WorkoutPlanResponse fromEntity(WorkoutPlan plan) {
        List<DayResponse> days = plan.getWorkoutDays().stream()
                .map(WorkoutPlanResponse::mapDay)
                .toList();

        return new WorkoutPlanResponse(
                plan.getId(),
                plan.getVersion(),
                plan.getStatus().name(),
                plan.getIntensityLevel().name(),
                plan.getDaysPerWeek(),
                plan.getCreatedAt(),
                plan.getChangeSummary(),
                days
        );
    }

    private static DayResponse mapDay(WorkoutDay day) {
        List<ExerciseResponse> exercises = day.getExercises().stream()
                .map(WorkoutPlanResponse::mapExercise)
                .toList();

        return new DayResponse(
                day.getId(),
                day.getDayNumber(),
                day.getDayLabel(),
                day.getFocusArea(),
                exercises
        );
    }

    private static ExerciseResponse mapExercise(WorkoutExercise exercise) {
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getExerciseName(),
                exercise.getSets(),
                exercise.getReps(),
                exercise.getRestSeconds(),
                exercise.getOrderIndex(),
                exercise.getNotes()
        );
    }
}
