package com.adaptivefit.service;

import com.adaptivefit.dto.response.DashboardResponse;
import com.adaptivefit.dto.response.ProgressResponse;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.WeeklyCheckIn;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.model.enums.PlanStatus;
import com.adaptivefit.repository.WeeklyCheckInRepository;
import com.adaptivefit.repository.WorkoutLogRepository;
import com.adaptivefit.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final WorkoutLogRepository workoutLogRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WeeklyCheckInRepository weeklyCheckInRepository;

    public ProgressService(WorkoutLogRepository workoutLogRepository,
                           WorkoutPlanRepository workoutPlanRepository,
                           WeeklyCheckInRepository weeklyCheckInRepository) {
        this.workoutLogRepository = workoutLogRepository;
        this.workoutPlanRepository = workoutPlanRepository;
        this.weeklyCheckInRepository = weeklyCheckInRepository;
    }

    public DashboardResponse getDashboard(Long userId) {
        // Total workouts completed
        long totalWorkoutsCompleted = workoutLogRepository.countByUserId(userId);

        // Workouts this week
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        int workoutsThisWeek = workoutLogRepository
                .findByUserIdAndCompletedAtBetween(userId, weekStart, weekEnd).size();

        // Current plan version
        WorkoutPlan activePlan = workoutPlanRepository
                .findByUserIdAndStatus(userId, PlanStatus.ACTIVE)
                .orElse(null);
        int currentPlanVersion = activePlan != null ? activePlan.getVersion() : 0;

        // Adherence percentage: total workouts completed / total planned since first plan
        double adherencePercentage = calculateAdherence(userId, activePlan, totalWorkoutsCompleted);

        // Next check-in date: 7 days after the last check-in
        LocalDate nextCheckInDate = calculateNextCheckInDate(userId);

        return new DashboardResponse(
                adherencePercentage,
                workoutsThisWeek,
                currentPlanVersion,
                nextCheckInDate,
                (int) totalWorkoutsCompleted
        );
    }

    public ProgressResponse getProgressData(Long userId) {
        // Weight trend from check-ins
        List<WeeklyCheckIn> checkIns = weeklyCheckInRepository.findByUserIdOrderByWeekNumberDesc(userId);
        List<ProgressResponse.WeightEntry> weightTrend = checkIns.stream()
                .filter(c -> c.getCurrentWeightKg() != null)
                .map(c -> new ProgressResponse.WeightEntry(
                        c.getSubmittedAt().toLocalDate(),
                        c.getCurrentWeightKg()))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());

        // Weekly adherence from check-ins
        List<WorkoutPlan> allPlans = workoutPlanRepository.findByUserIdOrderByVersionDesc(userId);
        List<ProgressResponse.WeeklyAdherence> weeklyAdherence = checkIns.stream()
                .map(c -> {
                    int planned = allPlans.stream()
                            .filter(p -> p.getVersion() == c.getPlanVersionBefore())
                            .findFirst()
                            .map(WorkoutPlan::getDaysPerWeek)
                            .orElse(0);
                    return new ProgressResponse.WeeklyAdherence(
                            c.getWeekNumber(),
                            c.getSessionsCompleted(),
                            planned);
                })
                .sorted((a, b) -> Integer.compare(a.getWeek(), b.getWeek()))
                .collect(Collectors.toList());

        // Plan history with change summaries
        List<ProgressResponse.PlanHistoryEntry> planHistory = allPlans.stream()
                .map(p -> new ProgressResponse.PlanHistoryEntry(
                        p.getVersion(),
                        p.getCreatedAt(),
                        p.getChangeSummary()))
                .sorted((a, b) -> Integer.compare(a.getVersion(), b.getVersion()))
                .collect(Collectors.toList());

        return new ProgressResponse(weightTrend, weeklyAdherence, planHistory);
    }

    private double calculateAdherence(Long userId, WorkoutPlan activePlan, long totalWorkoutsCompleted) {
        if (activePlan == null) {
            return 0.0;
        }

        // Get the first plan to determine start date
        List<WorkoutPlan> allPlans = workoutPlanRepository.findByUserIdOrderByVersionDesc(userId);
        if (allPlans.isEmpty()) {
            return 0.0;
        }

        WorkoutPlan firstPlan = allPlans.get(allPlans.size() - 1);
        LocalDate startDate = firstPlan.getCreatedAt().toLocalDate();
        LocalDate today = LocalDate.now();

        long weeksSinceStart = ChronoUnit.WEEKS.between(startDate, today);
        if (weeksSinceStart <= 0) {
            weeksSinceStart = 1;
        }

        // Approximate total planned = weeks * daysPerWeek of active plan
        long totalPlanned = weeksSinceStart * activePlan.getDaysPerWeek();
        if (totalPlanned == 0) {
            return 0.0;
        }

        double adherence = (totalWorkoutsCompleted * 100.0) / totalPlanned;
        return Math.min(100.0, Math.round(adherence * 10.0) / 10.0);
    }

    private LocalDate calculateNextCheckInDate(Long userId) {
        return weeklyCheckInRepository.findFirstByUserIdOrderBySubmittedAtDesc(userId)
                .map(checkIn -> checkIn.getSubmittedAt().toLocalDate().plusDays(7))
                .orElse(LocalDate.now());
    }
}
