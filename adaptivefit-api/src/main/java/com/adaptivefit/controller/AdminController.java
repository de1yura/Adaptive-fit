package com.adaptivefit.controller;

import com.adaptivefit.exception.BadRequestException;
import com.adaptivefit.model.EventLog;
import com.adaptivefit.repository.EventLogRepository;
import com.adaptivefit.service.DataExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin event logs and data export")
public class AdminController {

    private final EventLogRepository eventLogRepository;
    private final DataExportService dataExportService;
    private final String adminEmail;

    public AdminController(EventLogRepository eventLogRepository,
                           DataExportService dataExportService,
                           @Value("${app.admin.email}") String adminEmail) {
        this.eventLogRepository = eventLogRepository;
        this.dataExportService = dataExportService;
        this.adminEmail = adminEmail;
    }

    @GetMapping("/events")
    @Operation(summary = "Get event logs", description = "Returns event logs with optional filtering by event type and date range")
    public ResponseEntity<List<EventLog>> getEvents(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            Authentication authentication) {
        checkAdmin(authentication);

        List<EventLog> events;

        if (eventType != null && startDate != null && endDate != null) {
            events = eventLogRepository.findByEventTypeAndCreatedAtBetween(
                    eventType,
                    startDate.atStartOfDay(),
                    endDate.atTime(LocalTime.MAX));
        } else if (startDate != null && endDate != null) {
            events = eventLogRepository.findByCreatedAtBetween(
                    startDate.atStartOfDay(),
                    endDate.atTime(LocalTime.MAX));
        } else if (eventType != null) {
            events = eventLogRepository.findByEventType(eventType);
        } else {
            events = eventLogRepository.findAllByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/export/all")
    @Operation(summary = "Export all user data", description = "Exports anonymised data for all users (admin only)")
    public ResponseEntity<List<Map<String, Object>>> exportAll(Authentication authentication) {
        checkAdmin(authentication);
        List<Map<String, Object>> data = dataExportService.exportAllUsers();
        return ResponseEntity.ok(data);
    }

    private void checkAdmin(Authentication authentication) {
        String email = authentication.getName();
        if (!adminEmail.equals(email)) {
            throw new BadRequestException("Admin access required");
        }
    }
}
