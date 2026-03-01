package com.adaptivefit.model;

import com.adaptivefit.model.enums.DietaryPreference;
import com.adaptivefit.model.enums.EquipmentAccess;
import com.adaptivefit.model.enums.ExperienceLevel;
import com.adaptivefit.model.enums.FitnessGoal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    private FitnessGoal fitnessGoal;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;

    private int daysPerWeek;

    private int sessionDurationMinutes;

    @Enumerated(EnumType.STRING)
    private EquipmentAccess equipmentAccess;

    @Enumerated(EnumType.STRING)
    private DietaryPreference dietaryPreference;

    @Column(precision = 5, scale = 1)
    private BigDecimal heightCm;

    @Column(precision = 5, scale = 1)
    private BigDecimal weightKg;

    private Integer age;

    private int goalDurationWeeks;

    @Column(nullable = false)
    private boolean onboardingCompleted = false;
}
