package com.adaptivefit.repository;

import com.adaptivefit.model.NutritionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {

    List<NutritionPlan> findByUserIdOrderByPlanVersionDesc(Long userId);

    Optional<NutritionPlan> findFirstByUserIdOrderByPlanVersionDesc(Long userId);
}
