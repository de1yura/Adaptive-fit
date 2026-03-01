package com.adaptivefit.controller;

import com.adaptivefit.dto.request.NutritionLogRequest;
import com.adaptivefit.dto.response.NutritionPlanResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.NutritionLog;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.NutritionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;
    private final UserRepository userRepository;

    public NutritionController(NutritionService nutritionService, UserRepository userRepository) {
        this.nutritionService = nutritionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/targets")
    public ResponseEntity<NutritionPlanResponse> getTargets(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(nutritionService.getTargets(userId));
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> logNutrition(
            @Valid @RequestBody NutritionLogRequest request,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        NutritionLog log = nutritionService.logNutrition(userId, request);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "Nutrition logged successfully");
        result.put("logId", log.getId());
        result.put("logDate", log.getLogDate().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/log/history")
    public ResponseEntity<List<NutritionLog>> getHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(nutritionService.getHistory(userId));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }
}
