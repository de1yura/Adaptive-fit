package com.adaptivefit.controller;

import com.adaptivefit.dto.response.DashboardResponse;
import com.adaptivefit.dto.response.ProgressResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@Tag(name = "Progress", description = "Dashboard summary and progress data export")
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;

    public ProgressController(ProgressService progressService, UserRepository userRepository) {
        this.progressService = progressService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard", description = "Returns summary dashboard data including adherence, streaks, and recent activity")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        Long userId = getUserId(authentication);
        DashboardResponse dashboard = progressService.getDashboard(userId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/export")
    @Operation(summary = "Export progress data", description = "Returns weight trend, weekly adherence, and plan history for charts")
    public ResponseEntity<ProgressResponse> exportProgress(Authentication authentication) {
        Long userId = getUserId(authentication);
        ProgressResponse progress = progressService.getProgressData(userId);
        return ResponseEntity.ok(progress);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
