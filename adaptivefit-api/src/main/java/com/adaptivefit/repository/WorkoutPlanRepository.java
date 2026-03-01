package com.adaptivefit.repository;

import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.model.enums.PlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {

    Optional<WorkoutPlan> findByUserIdAndStatus(Long userId, PlanStatus status);

    List<WorkoutPlan> findByUserIdOrderByVersionDesc(Long userId);
}
