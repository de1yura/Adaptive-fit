package com.adaptivefit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class ProgressResponse {

    private List<WeightEntry> weightTrend;
    private List<WeeklyAdherence> weeklyAdherence;
    private List<PlanHistoryEntry> planHistory;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class WeightEntry {
        private LocalDate date;
        private BigDecimal weight;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class WeeklyAdherence {
        private int week;
        private int completed;
        private int planned;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class PlanHistoryEntry {
        private int version;
        private LocalDateTime date;
        private String changeSummary;
    }
}
