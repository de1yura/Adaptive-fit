package com.adaptivefit.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CheckInRequest {

    @NotNull
    @Min(1)
    private Integer weekNumber;

    @NotNull
    @Min(0)
    private Integer sessionsCompleted;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer difficultyRating;

    private BigDecimal currentWeightKg;

    private String notes;
}
