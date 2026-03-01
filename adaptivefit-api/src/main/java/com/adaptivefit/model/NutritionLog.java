package com.adaptivefit.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "nutrition_logs")
@Getter
@Setter
@NoArgsConstructor
public class NutritionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate logDate;

    private Integer caloriesConsumed;

    @Column(precision = 7, scale = 1)
    private BigDecimal proteinG;

    @Column(precision = 7, scale = 1)
    private BigDecimal carbsG;

    @Column(precision = 7, scale = 1)
    private BigDecimal fatsG;
}
