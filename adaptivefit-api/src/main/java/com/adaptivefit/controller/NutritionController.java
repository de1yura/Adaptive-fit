package com.adaptivefit.controller;

import com.adaptivefit.dto.request.NutritionLogRequest;
import com.adaptivefit.dto.response.NutritionPlanResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.NutritionLog;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.NutritionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Nutrition", description = "Nutrition targets, logging, and history")
public class NutritionController {

    private final NutritionService nutritionService;
    private final UserRepository userRepository;

    public NutritionController(NutritionService nutritionService, UserRepository userRepository) {
        this.nutritionService = nutritionService;
        this.userRepository = userRepository;
    }

    @GetMapping("/targets")
    @Operation(summary = "Get nutrition targets", description = "Returns the user's current nutrition plan with macro targets")
    public ResponseEntity<NutritionPlanResponse> getTargets(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(nutritionService.getTargets(userId));
    }

    @PostMapping("/log")
    @Operation(summary = "Log nutrition", description = "Logs a nutrition entry with calories and macro breakdown")
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
    @Operation(summary = "Get nutrition history", description = "Returns the user's nutrition log entries")
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
