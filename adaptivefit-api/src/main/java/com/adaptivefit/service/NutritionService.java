package com.adaptivefit.service;

import com.adaptivefit.dto.request.NutritionLogRequest;
import com.adaptivefit.dto.response.NutritionPlanResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.NutritionLog;
import com.adaptivefit.model.NutritionPlan;
import com.adaptivefit.repository.NutritionLogRepository;
import com.adaptivefit.repository.NutritionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NutritionService {

    private final NutritionPlanRepository nutritionPlanRepository;
    private final NutritionLogRepository nutritionLogRepository;
    private final EventLogService eventLogService;

    public NutritionService(NutritionPlanRepository nutritionPlanRepository,
                            NutritionLogRepository nutritionLogRepository,
                            EventLogService eventLogService) {
        this.nutritionPlanRepository = nutritionPlanRepository;
        this.nutritionLogRepository = nutritionLogRepository;
        this.eventLogService = eventLogService;
    }

    public NutritionPlanResponse getTargets(Long userId) {
        NutritionPlan plan = nutritionPlanRepository.findFirstByUserIdOrderByPlanVersionDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No nutrition plan found"));
        return NutritionPlanResponse.fromEntity(plan);
    }

    @Transactional
    public NutritionLog logNutrition(Long userId, NutritionLogRequest request) {
        NutritionLog log = nutritionLogRepository.findByUserIdAndLogDate(userId, request.getLogDate())
                .orElse(new NutritionLog());

        log.setUserId(userId);
        log.setLogDate(request.getLogDate());
        log.setCaloriesConsumed(request.getCaloriesConsumed());
        log.setProteinG(request.getProteinG());
        log.setCarbsG(request.getCarbsG());
        log.setFatsG(request.getFatsG());
        log = nutritionLogRepository.save(log);

        eventLogService.logEvent(userId, "NUTRITION_LOGGED",
                "{\"logDate\":\"" + request.getLogDate() + "\",\"calories\":" + request.getCaloriesConsumed() + "}");

        return log;
    }

    public List<NutritionLog> getHistory(Long userId) {
        return nutritionLogRepository.findByUserIdOrderByLogDateDesc(userId);
    }
}
