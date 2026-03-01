package com.adaptivefit.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AdaptationResponse {

    private String changeSummary;
    private int newPlanVersion;
    private boolean changesWereMade;
}
