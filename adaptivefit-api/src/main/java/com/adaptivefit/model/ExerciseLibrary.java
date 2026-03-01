package com.adaptivefit.model;

import com.adaptivefit.model.enums.EquipmentRequired;
import com.adaptivefit.model.enums.ExperienceLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exercise_library")
@Getter
@Setter
@NoArgsConstructor
public class ExerciseLibrary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private String muscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentRequired equipmentRequired;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExperienceLevel difficulty;

    @Column(columnDefinition = "TEXT")
    private String description;
}
