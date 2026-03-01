package com.adaptivefit.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
@Getter
@Setter
@NoArgsConstructor
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long workoutDayId;

    @Column(nullable = false)
    private LocalDate completedAt;

    @Column(nullable = false)
    private boolean markedComplete = false;
}
