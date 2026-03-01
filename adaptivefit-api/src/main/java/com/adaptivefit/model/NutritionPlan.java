package com.adaptivefit.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_plans")
@Getter
@Setter
@NoArgsConstructor
public class NutritionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int planVersion;

    @Column(nullable = false)
    private int dailyCalories;

    @Column(nullable = false)
    private int proteinG;

    @Column(nullable = false)
    private int carbsG;

    @Column(nullable = false)
    private int fatsG;

    @Column(columnDefinition = "TEXT")
    private String dietaryTips;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
