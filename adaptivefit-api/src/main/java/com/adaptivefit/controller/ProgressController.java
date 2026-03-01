package com.adaptivefit.controller;

import com.adaptivefit.dto.response.DashboardResponse;
import com.adaptivefit.dto.response.ProgressResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.ProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;

    public ProgressController(ProgressService progressService, UserRepository userRepository) {
        this.progressService = progressService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        Long userId = getUserId(authentication);
        DashboardResponse dashboard = progressService.getDashboard(userId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/export")
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
