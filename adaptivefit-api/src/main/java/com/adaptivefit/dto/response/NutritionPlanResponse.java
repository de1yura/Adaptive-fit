package com.adaptivefit.dto.response;

import com.adaptivefit.model.NutritionPlan;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class NutritionPlanResponse {

    private int dailyCalories;
    private int proteinG;
    private int carbsG;
    private int fatsG;
    private List<String> dietaryTips;

    public static NutritionPlanResponse fromEntity(NutritionPlan plan) {
        List<String> tips = parseDietaryTips(plan.getDietaryTips());
        return new NutritionPlanResponse(
                plan.getDailyCalories(),
                plan.getProteinG(),
                plan.getCarbsG(),
                plan.getFatsG(),
                tips
        );
    }

    private static List<String> parseDietaryTips(String tipsJson) {
        if (tipsJson == null || tipsJson.isBlank()) {
            return new ArrayList<>();
        }
        List<String> tips = new ArrayList<>();
        // Parse JSON array of strings manually (no Jackson dependency in DTO layer)
        String content = tipsJson.trim();
        if (content.startsWith("[") && content.endsWith("]")) {
            content = content.substring(1, content.length() - 1).trim();
            if (content.isEmpty()) {
                return tips;
            }
            // Split by "," pattern (comma between quoted strings)
            int i = 0;
            while (i < content.length()) {
                // Find opening quote
                int start = content.indexOf('"', i);
                if (start == -1) break;
                // Find closing quote (handle escaped quotes)
                int end = start + 1;
                while (end < content.length()) {
                    if (content.charAt(end) == '\\') {
                        end += 2;
                        continue;
                    }
                    if (content.charAt(end) == '"') {
                        break;
                    }
                    end++;
                }
                if (end < content.length()) {
                    tips.add(content.substring(start + 1, end));
                }
                i = end + 1;
            }
        }
        return tips;
    }
}
