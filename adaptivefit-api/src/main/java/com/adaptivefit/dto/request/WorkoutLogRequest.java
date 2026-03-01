package com.adaptivefit.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class WorkoutLogRequest {

    @NotNull(message = "Day ID is required")
    private Long dayId;

    private List<ExerciseLogEntry> exerciseLogs;

    @Getter
    @Setter
    public static class ExerciseLogEntry {
        @NotNull(message = "Exercise ID is required")
        private Long exerciseId;
        private Integer actualSets;
        private String actualReps;
        private BigDecimal actualWeightKg;
    }
}
