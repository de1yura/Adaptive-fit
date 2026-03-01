package com.adaptivefit.repository;

import com.adaptivefit.model.ExerciseLibrary;
import com.adaptivefit.model.enums.EquipmentRequired;
import com.adaptivefit.model.enums.ExperienceLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseLibraryRepository extends JpaRepository<ExerciseLibrary, Long> {

    List<ExerciseLibrary> findByMuscleGroup(String muscleGroup);

    List<ExerciseLibrary> findByEquipmentRequired(EquipmentRequired equipmentRequired);

    List<ExerciseLibrary> findByDifficulty(ExperienceLevel difficulty);

    List<ExerciseLibrary> findByMuscleGroupAndDifficultyIn(String muscleGroup, List<ExperienceLevel> difficulties);
}
