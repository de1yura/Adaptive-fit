package com.adaptivefit.service;

import com.adaptivefit.model.*;
import com.adaptivefit.model.enums.*;
import com.adaptivefit.repository.ExerciseLibraryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class PlanGeneratorServiceTest {

    @Mock
    private ExerciseLibraryRepository exerciseLibraryRepository;

    @InjectMocks
    private PlanGeneratorService planGeneratorService;

    @BeforeEach
    void setUp() {
        List<ExerciseLibrary> exercises = createExerciseLibrary();
        lenient().when(exerciseLibraryRepository.findAll()).thenReturn(exercises);
    }

    // ---- Workout Split Tests ----

    @Test
    void workoutSplit_2Days_generatesFullBody() {
        UserProfile profile = createProfile(2, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        assertEquals(2, plan.getWorkoutDays().size());
        assertTrue(plan.getWorkoutDays().get(0).getDayLabel().contains("Full Body A"));
        assertTrue(plan.getWorkoutDays().get(1).getDayLabel().contains("Full Body B"));
        assertEquals("Full Body", plan.getWorkoutDays().get(0).getFocusArea());
        assertEquals("Full Body", plan.getWorkoutDays().get(1).getFocusArea());
    }

    @Test
    void workoutSplit_3Days_generatesPPL() {
        UserProfile profile = createProfile(3, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        assertEquals(3, plan.getWorkoutDays().size());
        assertTrue(plan.getWorkoutDays().get(0).getDayLabel().contains("Push"));
        assertTrue(plan.getWorkoutDays().get(1).getDayLabel().contains("Pull"));
        assertTrue(plan.getWorkoutDays().get(2).getDayLabel().contains("Legs"));
    }

    @Test
    void workoutSplit_4Days_generatesUpperLowerTwice() {
        UserProfile profile = createProfile(4, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        assertEquals(4, plan.getWorkoutDays().size());
        assertTrue(plan.getWorkoutDays().get(0).getDayLabel().contains("Upper"));
        assertTrue(plan.getWorkoutDays().get(1).getDayLabel().contains("Lower"));
        assertTrue(plan.getWorkoutDays().get(2).getDayLabel().contains("Upper"));
        assertTrue(plan.getWorkoutDays().get(3).getDayLabel().contains("Lower"));
    }

    @Test
    void workoutSplit_5Days_generatesPPLPlusUpperLower() {
        UserProfile profile = createProfile(5, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        assertEquals(5, plan.getWorkoutDays().size());
        assertTrue(plan.getWorkoutDays().get(0).getDayLabel().contains("Push"));
        assertTrue(plan.getWorkoutDays().get(1).getDayLabel().contains("Pull"));
        assertTrue(plan.getWorkoutDays().get(2).getDayLabel().contains("Legs"));
        assertTrue(plan.getWorkoutDays().get(3).getDayLabel().contains("Upper"));
        assertTrue(plan.getWorkoutDays().get(4).getDayLabel().contains("Lower"));
    }

    @Test
    void workoutSplit_6Days_generatesPPLTwice() {
        UserProfile profile = createProfile(6, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        assertEquals(6, plan.getWorkoutDays().size());
        assertTrue(plan.getWorkoutDays().get(0).getDayLabel().contains("Push"));
        assertTrue(plan.getWorkoutDays().get(1).getDayLabel().contains("Pull"));
        assertTrue(plan.getWorkoutDays().get(2).getDayLabel().contains("Legs"));
        assertTrue(plan.getWorkoutDays().get(3).getDayLabel().contains("Push"));
        assertTrue(plan.getWorkoutDays().get(4).getDayLabel().contains("Pull"));
        assertTrue(plan.getWorkoutDays().get(5).getDayLabel().contains("Legs"));
    }

    // ---- Exercise Count and Sets Tests ----

    @Test
    void exerciseCount_beginner_getsCorrectExercisesAndSets() {
        UserProfile profile = createProfile(2, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        for (WorkoutDay day : plan.getWorkoutDays()) {
            int count = day.getExercises().size();
            assertTrue(count >= 4 && count <= 5,
                    "BEGINNER should get 4-5 exercises, got " + count);
            for (WorkoutExercise ex : day.getExercises()) {
                assertEquals(3, ex.getSets(), "BEGINNER should have 3 sets");
            }
        }
    }

    @Test
    void exerciseCount_intermediate_getsCorrectExercisesAndSets() {
        UserProfile profile = createProfile(2, ExperienceLevel.INTERMEDIATE,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        for (WorkoutDay day : plan.getWorkoutDays()) {
            int count = day.getExercises().size();
            assertTrue(count >= 5 && count <= 6,
                    "INTERMEDIATE should get 5-6 exercises, got " + count);
            for (WorkoutExercise ex : day.getExercises()) {
                assertTrue(ex.getSets() >= 3 && ex.getSets() <= 4,
                        "INTERMEDIATE should have 3-4 sets");
            }
        }
    }

    @Test
    void exerciseCount_advanced_getsCorrectExercisesAndSets() {
        UserProfile profile = createProfile(2, ExperienceLevel.ADVANCED,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        WorkoutPlan plan = planGeneratorService.generateWorkoutPlan(profile);

        for (WorkoutDay day : plan.getWorkoutDays()) {
            int count = day.getExercises().size();
            assertTrue(count >= 6 && count <= 7,
                    "ADVANCED should get 6-7 exercises, got " + count);
            for (WorkoutExercise ex : day.getExercises()) {
                assertEquals(4, ex.getSets(), "ADVANCED should have 4 sets");
            }
        }
    }

    // ---- Nutrition Calculation Tests ----

    @Test
    void nutritionCalculation_verifyBmrTdeeAndMacros_fatLoss() {
        // Known inputs: 80kg, 175cm, 25 years, 4 days/week, FAT_LOSS
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.FAT_LOSS,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        // BMR = (10 * 80) + (6.25 * 175) - (5 * 25) - 78 = 1690.75
        double expectedBmr = (10 * 80.0) + (6.25 * 175.0) - (5 * 25) - 78;
        assertEquals(1690.75, expectedBmr, 0.01);

        // TDEE = BMR * 1.55 (4 days/week -> 3-4 range)
        double expectedTdee = expectedBmr * 1.55;

        // FAT_LOSS: calories = round(TDEE - 500)
        int expectedCalories = (int) Math.round(expectedTdee - 500);
        assertEquals(expectedCalories, plan.getDailyCalories());

        // Protein = round(80 * 2.2) = 176
        int expectedProtein = (int) Math.round(80.0 * 2.2);
        assertEquals(expectedProtein, plan.getProteinG());

        // Fats = round(calories * 0.25 / 9)
        int expectedFats = (int) Math.round(expectedCalories * 0.25 / 9);
        assertEquals(expectedFats, plan.getFatsG());

        // Carbs = round((calories - protein*4 - fats*9) / 4)
        int expectedCarbs = (int) Math.round(
                (double) (expectedCalories - expectedProtein * 4 - expectedFats * 9) / 4);
        assertEquals(expectedCarbs, plan.getCarbsG());
    }

    @Test
    void nutritionCalculation_muscleGain_addsCalories() {
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.MUSCLE_GAIN,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        double bmr = (10 * 80.0) + (6.25 * 175.0) - (5 * 25) - 78;
        double tdee = bmr * 1.55;
        int expectedCalories = (int) Math.round(tdee + 300);
        assertEquals(expectedCalories, plan.getDailyCalories());
    }

    @Test
    void nutritionCalculation_generalFitness_maintainsTdee() {
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.GENERAL_FITNESS,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        double bmr = (10 * 80.0) + (6.25 * 175.0) - (5 * 25) - 78;
        double tdee = bmr * 1.55;
        int expectedCalories = (int) Math.round(tdee);
        assertEquals(expectedCalories, plan.getDailyCalories());
    }

    // ---- Fallback Tests (null body stats) ----

    @Test
    void nutritionFallback_fatLoss_usesStaticDefaults() {
        UserProfile profile = createProfile(4, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.FAT_LOSS);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals(1800, plan.getDailyCalories());
        assertEquals(150, plan.getProteinG());
        assertEquals(180, plan.getCarbsG());
        assertEquals(50, plan.getFatsG());
    }

    @Test
    void nutritionFallback_muscleGain_usesStaticDefaults() {
        UserProfile profile = createProfile(4, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.MUSCLE_GAIN);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals(2800, plan.getDailyCalories());
        assertEquals(180, plan.getProteinG());
        assertEquals(320, plan.getCarbsG());
        assertEquals(75, plan.getFatsG());
    }

    @Test
    void nutritionFallback_generalFitness_usesStaticDefaults() {
        UserProfile profile = createProfile(4, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.GENERAL_FITNESS);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals(2200, plan.getDailyCalories());
        assertEquals(130, plan.getProteinG());
        assertEquals(250, plan.getCarbsG());
        assertEquals(65, plan.getFatsG());
    }

    @Test
    void nutritionFallback_partialNullStats_usesDefaults() {
        // Only weightKg set, but heightCm and age are null
        UserProfile profile = createProfile(4, ExperienceLevel.BEGINNER,
                EquipmentAccess.FULL_GYM, FitnessGoal.FAT_LOSS);
        profile.setWeightKg(new BigDecimal("80"));

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals(1800, plan.getDailyCalories());
        assertEquals(150, plan.getProteinG());
    }

    // ---- Macro Split Tests ----

    @Test
    void macroSplit_fatLoss_proteinIsWeightTimes2Point2() {
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.FAT_LOSS,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals((int) Math.round(80.0 * 2.2), plan.getProteinG());
    }

    @Test
    void macroSplit_muscleGain_proteinIsWeightTimes2Point0() {
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.MUSCLE_GAIN,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals((int) Math.round(80.0 * 2.0), plan.getProteinG());
    }

    @Test
    void macroSplit_generalFitness_proteinIsWeightTimes1Point6() {
        UserProfile profile = createProfileWithBodyStats(4, FitnessGoal.GENERAL_FITNESS,
                new BigDecimal("80"), new BigDecimal("175"), 25);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals((int) Math.round(80.0 * 1.6), plan.getProteinG());
    }

    @Test
    void macroSplit_fatLoss_differentWeight_proteinScalesCorrectly() {
        UserProfile profile = createProfileWithBodyStats(3, FitnessGoal.FAT_LOSS,
                new BigDecimal("65"), new BigDecimal("165"), 30);

        NutritionPlan plan = planGeneratorService.generateNutritionPlan(profile);

        assertEquals((int) Math.round(65.0 * 2.2), plan.getProteinG());
    }

    // ---- Helper methods ----

    private UserProfile createProfile(int daysPerWeek, ExperienceLevel level,
                                       EquipmentAccess equipment, FitnessGoal goal) {
        UserProfile profile = new UserProfile();
        profile.setUserId(1L);
        profile.setDaysPerWeek(daysPerWeek);
        profile.setExperienceLevel(level);
        profile.setEquipmentAccess(equipment);
        profile.setFitnessGoal(goal);
        profile.setDietaryPreference(DietaryPreference.NO_PREFERENCE);
        return profile;
    }

    private UserProfile createProfileWithBodyStats(int daysPerWeek, FitnessGoal goal,
                                                    BigDecimal weightKg, BigDecimal heightCm, int age) {
        UserProfile profile = createProfile(daysPerWeek, ExperienceLevel.INTERMEDIATE,
                EquipmentAccess.FULL_GYM, goal);
        profile.setWeightKg(weightKg);
        profile.setHeightCm(heightCm);
        profile.setAge(age);
        return profile;
    }

    private List<ExerciseLibrary> createExerciseLibrary() {
        List<ExerciseLibrary> exercises = new ArrayList<>();
        String[] muscleGroups = {"Chest", "Back", "Shoulders", "Quadriceps",
                "Hamstrings", "Glutes", "Biceps", "Triceps", "Core", "Full Body"};
        EquipmentRequired[] equipmentTypes = {EquipmentRequired.NONE,
                EquipmentRequired.DUMBBELLS, EquipmentRequired.BARBELL};
        ExperienceLevel[] levels = {ExperienceLevel.BEGINNER,
                ExperienceLevel.INTERMEDIATE, ExperienceLevel.ADVANCED};

        long id = 1;
        for (String group : muscleGroups) {
            for (EquipmentRequired eq : equipmentTypes) {
                for (ExperienceLevel level : levels) {
                    ExerciseLibrary ex = new ExerciseLibrary();
                    ex.setId(id++);
                    ex.setName(group + " " + eq + " " + level);
                    ex.setMuscleGroup(group);
                    ex.setEquipmentRequired(eq);
                    ex.setDifficulty(level);
                    exercises.add(ex);
                }
            }
        }
        return exercises;
    }
}
