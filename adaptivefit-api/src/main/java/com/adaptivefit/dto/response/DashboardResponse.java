package com.adaptivefit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class DashboardResponse {

    private double adherencePercentage;
    private int workoutsThisWeek;
    private int currentPlanVersion;
    private LocalDate nextCheckInDate;
    private int totalWorkoutsCompleted;
}
