package com.adaptivefit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class AdaptationResponse {

    private String changeSummary;
    private int newPlanVersion;
    private boolean changesApplied;
    private List<String> adaptationDetails;
}
