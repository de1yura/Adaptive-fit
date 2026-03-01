package com.adaptivefit.repository;

import com.adaptivefit.model.ExerciseLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseLogRepository extends JpaRepository<ExerciseLog, Long> {

    List<ExerciseLog> findByWorkoutLogId(Long workoutLogId);
}
