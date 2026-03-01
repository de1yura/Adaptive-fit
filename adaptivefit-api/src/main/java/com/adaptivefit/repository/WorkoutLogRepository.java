package com.adaptivefit.repository;

import com.adaptivefit.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {

    List<WorkoutLog> findByUserIdAndCompletedAtBetween(Long userId, LocalDate start, LocalDate end);
}
