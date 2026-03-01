package com.adaptivefit.service;

import com.adaptivefit.model.*;
import com.adaptivefit.model.enums.*;
import com.adaptivefit.repository.ExerciseLibraryRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlanGeneratorService {

    private final ExerciseLibraryRepository exerciseLibraryRepository;

    public PlanGeneratorService(ExerciseLibraryRepository exerciseLibraryRepository) {
        this.exerciseLibraryRepository = exerciseLibraryRepository;
    }

    public WorkoutPlan generateWorkoutPlan(UserProfile profile) {
        WorkoutPlan plan = new WorkoutPlan();
        plan.setUserId(profile.getUserId());
        plan.setVersion(1);
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setIntensityLevel(IntensityLevel.MODERATE);
        plan.setDaysPerWeek(profile.getDaysPerWeek());

        List<DayConfig> dayConfigs = getSplitConfig(profile.getDaysPerWeek());
        List<ExerciseLibrary> allExercises = exerciseLibraryRepository.findAll();

        List<EquipmentRequired> compatibleEquipment = getCompatibleEquipment(profile.getEquipmentAccess());
        List<ExperienceLevel> appropriateDifficulties = getAppropriateDifficulties(profile.getExperienceLevel());

        String reps = getReps(profile.getFitnessGoal());
        int restSeconds = getRestSeconds(profile.getFitnessGoal());
        int sets = getSets(profile.getExperienceLevel());
        int exerciseCount = getExerciseCount(profile.getExperienceLevel());

        for (int i = 0; i < dayConfigs.size(); i++) {
            DayConfig config = dayConfigs.get(i);
            WorkoutDay day = new WorkoutDay();
            day.setWorkoutPlan(plan);
            day.setDayNumber(i + 1);
            day.setDayLabel("Day " + (i + 1) + " - " + config.label);
            day.setFocusArea(config.focusArea);

            List<ExerciseLibrary> selectedExercises = selectExercises(
                    allExercises, config.muscleGroups, compatibleEquipment,
                    appropriateDifficulties, exerciseCount);

            for (int j = 0; j < selectedExercises.size(); j++) {
                WorkoutExercise exercise = new WorkoutExercise();
                exercise.setWorkoutDay(day);
                exercise.setExerciseName(selectedExercises.get(j).getName());
                exercise.setSets(sets);
                exercise.setReps(reps);
                exercise.setRestSeconds(restSeconds);
                exercise.setOrderIndex(j + 1);
                day.getExercises().add(exercise);
            }

            plan.getWorkoutDays().add(day);
        }

        return plan;
    }

    public NutritionPlan generateNutritionPlan(UserProfile profile) {
        NutritionPlan plan = new NutritionPlan();
        plan.setUserId(profile.getUserId());
        plan.setPlanVersion(1);

        FitnessGoal goal = profile.getFitnessGoal();

        boolean hasBodyStats = profile.getHeightCm() != null
                && profile.getWeightKg() != null
                && profile.getAge() != null;

        int calories;
        int protein;
        int carbs;
        int fats;

        if (hasBodyStats) {
            double weightKg = profile.getWeightKg().doubleValue();
            double heightCm = profile.getHeightCm().doubleValue();
            int age = profile.getAge();

            double bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 78;

            double activityMultiplier = getActivityMultiplier(profile.getDaysPerWeek());
            double tdee = bmr * activityMultiplier;

            calories = (int) Math.round(switch (goal) {
                case FAT_LOSS -> tdee - 500;
                case MUSCLE_GAIN -> tdee + 300;
                case GENERAL_FITNESS -> tdee;
            });

            double proteinMultiplier = switch (goal) {
                case FAT_LOSS -> 2.2;
                case MUSCLE_GAIN -> 2.0;
                case GENERAL_FITNESS -> 1.6;
            };

            double fatPct = switch (goal) {
                case FAT_LOSS, MUSCLE_GAIN -> 0.25;
                case GENERAL_FITNESS -> 0.30;
            };

            protein = (int) Math.round(weightKg * proteinMultiplier);
            fats = (int) Math.round(calories * fatPct / 9);
            int proteinCalories = protein * 4;
            int fatCalories = fats * 9;
            carbs = (int) Math.round((double) (calories - proteinCalories - fatCalories) / 4);
        } else {
            switch (goal) {
                case FAT_LOSS -> {
                    calories = 1800; protein = 150; carbs = 180; fats = 50;
                }
                case MUSCLE_GAIN -> {
                    calories = 2800; protein = 180; carbs = 320; fats = 75;
                }
                case GENERAL_FITNESS -> {
                    calories = 2200; protein = 130; carbs = 250; fats = 65;
                }
                default -> {
                    calories = 2200; protein = 130; carbs = 250; fats = 65;
                }
            }
        }

        plan.setDailyCalories(calories);
        plan.setProteinG(protein);
        plan.setCarbsG(carbs);
        plan.setFatsG(fats);

        List<String> tips = generateDietaryTips(goal, profile.getDietaryPreference());
        plan.setDietaryTips(tipsToJson(tips));

        return plan;
    }

    private double getActivityMultiplier(int daysPerWeek) {
        if (daysPerWeek <= 2) return 1.375;
        if (daysPerWeek <= 4) return 1.55;
        if (daysPerWeek <= 6) return 1.725;
        return 1.9;
    }

    private List<String> generateDietaryTips(FitnessGoal goal, DietaryPreference preference) {
        List<String> tips = new ArrayList<>();

        switch (goal) {
            case FAT_LOSS -> {
                tips.add("Focus on high-protein meals to preserve muscle during a caloric deficit");
                tips.add("Eat plenty of vegetables and fibre-rich foods to stay satiated");
                tips.add("Stay hydrated — aim for at least 2-3 litres of water daily");
            }
            case MUSCLE_GAIN -> {
                tips.add("Eat a protein-rich meal within 2 hours after training");
                tips.add("Spread protein intake evenly across 4-5 meals per day");
                tips.add("Include calorie-dense whole foods like nuts, avocados, and olive oil");
            }
            case GENERAL_FITNESS -> {
                tips.add("Eat a balanced diet with a variety of whole foods");
                tips.add("Prioritise lean protein sources with every meal");
                tips.add("Limit processed foods and added sugars");
            }
        }

        if (preference != null) {
            switch (preference) {
                case VEGETARIAN -> tips.add("Great vegetarian protein sources include eggs, Greek yoghurt, cottage cheese, tofu, and legumes");
                case VEGAN -> tips.add("Include plant-based protein sources such as tofu, tempeh, lentils, chickpeas, quinoa, and hemp seeds");
                case HALAL -> tips.add("Choose halal-certified protein sources like chicken, lamb, beef, fish, eggs, and legumes");
                case GLUTEN_FREE -> tips.add("Use gluten-free grains like rice, quinoa, buckwheat, and oats (certified GF) for your carb sources");
                case NO_PREFERENCE -> {}
            }
        }

        return tips;
    }

    private String tipsToJson(List<String> tips) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < tips.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(tips.get(i).replace("\"", "\\\"")).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }

    private List<DayConfig> getSplitConfig(int daysPerWeek) {
        List<DayConfig> configs = new ArrayList<>();

        if (daysPerWeek <= 2) {
            configs.add(new DayConfig("Full Body A", "Full Body",
                    "Chest", "Back", "Quadriceps", "Core", "Full Body"));
            if (daysPerWeek == 2) {
                configs.add(new DayConfig("Full Body B", "Full Body",
                        "Shoulders", "Hamstrings", "Glutes", "Biceps", "Triceps"));
            }
        } else if (daysPerWeek == 3) {
            configs.addAll(createPPL());
        } else if (daysPerWeek == 4) {
            configs.addAll(createUpperLower());
            configs.addAll(createUpperLower());
        } else if (daysPerWeek == 5) {
            configs.addAll(createPPL());
            configs.addAll(createUpperLower());
        } else {
            configs.addAll(createPPL());
            configs.addAll(createPPL());
        }

        return configs;
    }

    private List<DayConfig> createPPL() {
        return List.of(
                new DayConfig("Push", "Chest, Shoulders & Triceps",
                        "Chest", "Shoulders", "Triceps"),
                new DayConfig("Pull", "Back & Biceps",
                        "Back", "Biceps"),
                new DayConfig("Legs", "Quadriceps, Hamstrings & Glutes",
                        "Quadriceps", "Hamstrings", "Glutes")
        );
    }

    private List<DayConfig> createUpperLower() {
        return List.of(
                new DayConfig("Upper", "Chest, Back & Arms",
                        "Chest", "Back", "Shoulders", "Biceps", "Triceps"),
                new DayConfig("Lower", "Quadriceps, Hamstrings & Glutes",
                        "Quadriceps", "Hamstrings", "Glutes", "Core")
        );
    }

    private List<ExerciseLibrary> selectExercises(
            List<ExerciseLibrary> allExercises,
            List<String> muscleGroups,
            List<EquipmentRequired> compatibleEquipment,
            List<ExperienceLevel> appropriateDifficulties,
            int targetCount) {

        Map<String, List<ExerciseLibrary>> exercisesByGroup = new LinkedHashMap<>();
        for (String group : muscleGroups) {
            List<ExerciseLibrary> filtered = allExercises.stream()
                    .filter(e -> e.getMuscleGroup().equals(group))
                    .filter(e -> compatibleEquipment.contains(e.getEquipmentRequired()))
                    .filter(e -> appropriateDifficulties.contains(e.getDifficulty()))
                    .collect(Collectors.toList());
            exercisesByGroup.put(group, filtered);
        }

        List<ExerciseLibrary> selected = new ArrayList<>();
        int remaining = targetCount;
        int groupsLeft = muscleGroups.size();

        for (String group : muscleGroups) {
            int countForGroup = (int) Math.ceil((double) remaining / groupsLeft);
            List<ExerciseLibrary> available = exercisesByGroup.get(group);
            int take = Math.min(countForGroup, available.size());
            selected.addAll(available.subList(0, take));
            remaining -= take;
            groupsLeft--;
        }

        return selected;
    }

    private List<EquipmentRequired> getCompatibleEquipment(EquipmentAccess access) {
        return switch (access) {
            case BODYWEIGHT_ONLY -> List.of(EquipmentRequired.NONE);
            case HOME_BASIC -> List.of(EquipmentRequired.NONE, EquipmentRequired.DUMBBELLS);
            case FULL_GYM -> List.of(EquipmentRequired.NONE, EquipmentRequired.DUMBBELLS,
                    EquipmentRequired.BARBELL, EquipmentRequired.CABLE_MACHINE, EquipmentRequired.FULL_GYM);
        };
    }

    private List<ExperienceLevel> getAppropriateDifficulties(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> List.of(ExperienceLevel.BEGINNER);
            case INTERMEDIATE -> List.of(ExperienceLevel.BEGINNER, ExperienceLevel.INTERMEDIATE);
            case ADVANCED -> List.of(ExperienceLevel.BEGINNER, ExperienceLevel.INTERMEDIATE, ExperienceLevel.ADVANCED);
        };
    }

    private String getReps(FitnessGoal goal) {
        return switch (goal) {
            case FAT_LOSS -> "12-15";
            case MUSCLE_GAIN -> "6-10";
            case GENERAL_FITNESS -> "8-12";
        };
    }

    private int getRestSeconds(FitnessGoal goal) {
        return switch (goal) {
            case FAT_LOSS -> 45;
            case MUSCLE_GAIN -> 90;
            case GENERAL_FITNESS -> 60;
        };
    }

    private int getSets(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> 3;
            case INTERMEDIATE, ADVANCED -> 4;
        };
    }

    private int getExerciseCount(ExperienceLevel level) {
        return switch (level) {
            case BEGINNER -> 5;
            case INTERMEDIATE -> 6;
            case ADVANCED -> 7;
        };
    }

    private static class DayConfig {
        final String label;
        final String focusArea;
        final List<String> muscleGroups;

        DayConfig(String label, String focusArea, String... muscleGroups) {
            this.label = label;
            this.focusArea = focusArea;
            this.muscleGroups = Arrays.asList(muscleGroups);
        }
    }
}
