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
