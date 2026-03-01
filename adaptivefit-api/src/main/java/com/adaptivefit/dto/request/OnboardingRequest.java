package com.adaptivefit.dto.request;

import com.adaptivefit.model.enums.DietaryPreference;
import com.adaptivefit.model.enums.EquipmentAccess;
import com.adaptivefit.model.enums.ExperienceLevel;
import com.adaptivefit.model.enums.FitnessGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OnboardingRequest {

    @NotNull(message = "Fitness goal is required")
    private FitnessGoal fitnessGoal;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @Min(value = 1, message = "Days per week must be at least 1")
    @Max(value = 7, message = "Days per week must be at most 7")
    private int daysPerWeek;

    @Min(value = 15, message = "Session duration must be at least 15 minutes")
    @Max(value = 180, message = "Session duration must be at most 180 minutes")
    private int sessionDurationMinutes;

    @NotNull(message = "Equipment access is required")
    private EquipmentAccess equipmentAccess;

    @NotNull(message = "Dietary preference is required")
    private DietaryPreference dietaryPreference;

    private BigDecimal heightCm;

    private BigDecimal weightKg;

    private Integer age;

    @Min(value = 1, message = "Goal duration must be at least 1 week")
    private int goalDurationWeeks;
}
