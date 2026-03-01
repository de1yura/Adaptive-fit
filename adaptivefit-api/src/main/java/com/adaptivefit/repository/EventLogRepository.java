package com.adaptivefit.repository;

import com.adaptivefit.model.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    List<EventLog> findByEventType(String eventType);

    List<EventLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<EventLog> findByEventTypeAndCreatedAtBetween(String eventType, LocalDateTime start, LocalDateTime end);

    List<EventLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<EventLog> findAllByOrderByCreatedAtDesc();
}
