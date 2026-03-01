package com.adaptivefit.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "weekly_check_ins")
@Getter
@Setter
@NoArgsConstructor
public class WeeklyCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private int weekNumber;

    @Column(nullable = false)
    private int sessionsCompleted;

    @Column(nullable = false)
    private int difficultyRating;

    @Column(precision = 5, scale = 1)
    private BigDecimal currentWeightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private int planVersionBefore;

    @Column(nullable = false)
    private int planVersionAfter;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
