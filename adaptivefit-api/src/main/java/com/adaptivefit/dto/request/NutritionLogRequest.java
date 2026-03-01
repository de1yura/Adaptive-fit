package com.adaptivefit.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class NutritionLogRequest {

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private Integer caloriesConsumed;

    private BigDecimal proteinG;

    private BigDecimal carbsG;

    private BigDecimal fatsG;
}
