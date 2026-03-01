package com.adaptivefit.repository;

import com.adaptivefit.model.WeeklyCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WeeklyCheckInRepository extends JpaRepository<WeeklyCheckIn, Long> {
    List<WeeklyCheckIn> findByUserIdOrderByWeekNumberDesc(Long userId);
}
