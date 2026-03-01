package com.adaptivefit.controller;

import com.adaptivefit.dto.request.CheckInRequest;
import com.adaptivefit.dto.response.AdaptationResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.model.WeeklyCheckIn;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.repository.WeeklyCheckInRepository;
import com.adaptivefit.repository.WorkoutPlanRepository;
import com.adaptivefit.service.AdaptiveEngineService;
import com.adaptivefit.service.EventLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checkin")
@Tag(name = "Check-In", description = "Weekly check-ins and adaptive plan adjustments")
public class CheckInController {

    private final AdaptiveEngineService adaptiveEngineService;
    private final EventLogService eventLogService;
    private final WeeklyCheckInRepository weeklyCheckInRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    public CheckInController(AdaptiveEngineService adaptiveEngineService,
                             EventLogService eventLogService,
                             WeeklyCheckInRepository weeklyCheckInRepository,
                             WorkoutPlanRepository workoutPlanRepository,
                             UserRepository userRepository) {
        this.adaptiveEngineService = adaptiveEngineService;
        this.eventLogService = eventLogService;
        this.weeklyCheckInRepository = weeklyCheckInRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/submit")
    @Operation(summary = "Submit weekly check-in", description = "Submits a weekly check-in and triggers adaptive plan adjustments if needed")
    public ResponseEntity<AdaptationResponse> submitCheckIn(
            @Valid @RequestBody CheckInRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);

        AdaptationResponse response = adaptiveEngineService.processCheckIn(userId, request);

        eventLogService.logEvent(userId, "CHECKIN_SUBMITTED",
                "{\"weekNumber\":" + request.getWeekNumber()
                        + ",\"sessionsCompleted\":" + request.getSessionsCompleted()
                        + ",\"difficultyRating\":" + request.getDifficultyRating() + "}");

        if (response.isChangesApplied()) {
            eventLogService.logEvent(userId, "PLAN_ADAPTED",
                    "{\"newPlanVersion\":" + response.getNewPlanVersion()
                            + ",\"changeSummary\":\"" + response.getChangeSummary().replace("\"", "\\\"") + "\"}");
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    @Operation(summary = "Get check-in history", description = "Returns all weekly check-ins ordered by week number descending")
    public ResponseEntity<List<WeeklyCheckIn>> getCheckInHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<WeeklyCheckIn> checkIns = weeklyCheckInRepository.findByUserIdOrderByWeekNumberDesc(userId);
        return ResponseEntity.ok(checkIns);
    }

    @GetMapping("/due")
    @Operation(summary = "Check if check-in is due", description = "Returns whether 7 or more days have passed since the last check-in")
    public ResponseEntity<Map<String, Boolean>> isCheckInDue(Authentication authentication) {
        Long userId = getUserId(authentication);

        boolean hasActivePlan = workoutPlanRepository
                .findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .isPresent();

        if (!hasActivePlan) {
            return ResponseEntity.ok(Map.of("due", false));
        }

        Optional<WeeklyCheckIn> lastCheckIn = weeklyCheckInRepository
                .findFirstByUserIdOrderBySubmittedAtDesc(userId);

        if (lastCheckIn.isEmpty()) {
            return ResponseEntity.ok(Map.of("due", true));
        }

        long daysSinceLastCheckIn = ChronoUnit.DAYS.between(
                lastCheckIn.get().getSubmittedAt(), LocalDateTime.now());
        boolean due = daysSinceLastCheckIn >= 7;

        return ResponseEntity.ok(Map.of("due", due));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
