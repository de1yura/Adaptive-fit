package com.adaptivefit.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "exercise_logs")
@Getter
@Setter
@NoArgsConstructor
public class ExerciseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long workoutLogId;

    @Column(nullable = false)
    private Long exerciseId;

    private Integer actualSets;

    private String actualReps;

    @Column(precision = 6, scale = 2)
    private BigDecimal actualWeightKg;
}
