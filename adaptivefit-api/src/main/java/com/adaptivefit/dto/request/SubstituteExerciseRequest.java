package com.adaptivefit.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubstituteExerciseRequest {

    @NotNull(message = "Exercise ID to replace is required")
    private Long exerciseId;

    @NotNull(message = "New exercise ID is required")
    private Long newExerciseId;
}
