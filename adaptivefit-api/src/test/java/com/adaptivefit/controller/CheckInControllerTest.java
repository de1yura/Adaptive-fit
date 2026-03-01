package com.adaptivefit.controller;

import com.adaptivefit.model.ExerciseLibrary;
import com.adaptivefit.model.User;
import com.adaptivefit.model.WorkoutPlan;
import com.adaptivefit.model.enums.*;
import com.adaptivefit.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CheckInControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private WorkoutPlanRepository workoutPlanRepository;

    @Autowired
    private NutritionPlanRepository nutritionPlanRepository;

    @Autowired
    private WeeklyCheckInRepository weeklyCheckInRepository;

    @Autowired
    private ExerciseLibraryRepository exerciseLibraryRepository;

    @Autowired
    private EventLogRepository eventLogRepository;

    @BeforeEach
    void setUp() {
        weeklyCheckInRepository.deleteAll();
        eventLogRepository.deleteAll();
        workoutPlanRepository.deleteAll();
        nutritionPlanRepository.deleteAll();
        userProfileRepository.deleteAll();
        userRepository.deleteAll();
        exerciseLibraryRepository.deleteAll();
        seedExerciseLibrary();
    }

    @Test
    void setupUser_completeOnboarding_planVersionIs1() throws Exception {
        String jwt = registerVerifyAndLogin("checkin@test.com", "password123");

        completeOnboarding(jwt);

        List<WorkoutPlan> plans = workoutPlanRepository.findAll();
        assertEquals(1, plans.size());
        assertEquals(1, plans.get(0).getVersion());
        assertEquals(PlanStatus.ACTIVE, plans.get(0).getStatus());
    }

    @Test
    void submitCheckIn_lowAdherence_reducesDaysAndIntensity() throws Exception {
        String jwt = registerVerifyAndLogin("lowadhere@test.com", "password123");
        completeOnboarding(jwt);

        // Plan has 3 days/week, MODERATE intensity
        // Send 1 session completed (1 < 3 * 0.6 = 1.8 → triggers adherence drop)
        MvcResult result = mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 1,
                                        "sessionsCompleted", 1,
                                        "difficultyRating", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.changesApplied").value(true))
                .andExpect(jsonPath("$.newPlanVersion").value(2))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        Map<?, ?> response = objectMapper.readValue(body, Map.class);
        List<?> details = (List<?>) response.get("adaptationDetails");
        assertTrue(details.contains("Adherence Drop"));

        // Verify new plan has reduced days and intensity
        WorkoutPlan activePlan = workoutPlanRepository.findAll().stream()
                .filter(p -> p.getStatus() == PlanStatus.ACTIVE)
                .findFirst().orElseThrow();
        assertEquals(2, activePlan.getVersion());
        assertEquals(2, activePlan.getDaysPerWeek());
        assertEquals(IntensityLevel.LIGHT, activePlan.getIntensityLevel());
    }

    @Test
    void submitCheckIn_highDifficulty_reducesIntensity() throws Exception {
        String jwt = registerVerifyAndLogin("hardrate@test.com", "password123");
        completeOnboarding(jwt);

        // Difficulty rating 4 → triggers "Too Hard" rule
        MvcResult result = mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 1,
                                        "sessionsCompleted", 3,
                                        "difficultyRating", 4))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.changesApplied").value(true))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        Map<?, ?> response = objectMapper.readValue(body, Map.class);
        List<?> details = (List<?>) response.get("adaptationDetails");
        assertTrue(details.contains("Too Hard"));

        // Verify intensity was reduced from MODERATE to LIGHT
        WorkoutPlan activePlan = workoutPlanRepository.findAll().stream()
                .filter(p -> p.getStatus() == PlanStatus.ACTIVE)
                .findFirst().orElseThrow();
        assertEquals(IntensityLevel.LIGHT, activePlan.getIntensityLevel());
    }

    @Test
    void submitCheckIn_perfectAdherence_noChanges() throws Exception {
        String jwt = registerVerifyAndLogin("perfect@test.com", "password123");
        completeOnboarding(jwt);

        // Full sessions (3) and difficulty 3 → perfect adherence, no changes
        mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 1,
                                        "sessionsCompleted", 3,
                                        "difficultyRating", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.changesApplied").value(false))
                .andExpect(jsonPath("$.newPlanVersion").value(1))
                .andExpect(jsonPath("$.adaptationDetails[0]").value("Perfect Adherence"));

        // Only one plan should exist (no new version created)
        List<WorkoutPlan> plans = workoutPlanRepository.findAll();
        assertEquals(1, plans.size());
        assertEquals(PlanStatus.ACTIVE, plans.get(0).getStatus());
    }

    @Test
    void getCheckInHistory_returnsSubmittedCheckIns() throws Exception {
        String jwt = registerVerifyAndLogin("history@test.com", "password123");
        completeOnboarding(jwt);

        // Submit two check-ins
        mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 1,
                                        "sessionsCompleted", 3,
                                        "difficultyRating", 3))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 2,
                                        "sessionsCompleted", 3,
                                        "difficultyRating", 3))))
                .andExpect(status().isOk());

        // Fetch history
        mockMvc.perform(get("/api/checkin/history")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].weekNumber").value(2))
                .andExpect(jsonPath("$[1].weekNumber").value(1));
    }

    @Test
    void submitCheckIn_lowAdherence_archivesOldPlanActivatesNew() throws Exception {
        String jwt = registerVerifyAndLogin("archive@test.com", "password123");
        completeOnboarding(jwt);

        // Submit check-in with low adherence to trigger plan change
        mockMvc.perform(post("/api/checkin/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("weekNumber", 1,
                                        "sessionsCompleted", 1,
                                        "difficultyRating", 3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.changesApplied").value(true));

        // Verify old plan is ARCHIVED, new plan is ACTIVE
        List<WorkoutPlan> plans = workoutPlanRepository.findAll();
        assertEquals(2, plans.size());

        WorkoutPlan archivedPlan = plans.stream()
                .filter(p -> p.getVersion() == 1)
                .findFirst().orElseThrow();
        assertEquals(PlanStatus.ARCHIVED, archivedPlan.getStatus());

        WorkoutPlan activePlan = plans.stream()
                .filter(p -> p.getVersion() == 2)
                .findFirst().orElseThrow();
        assertEquals(PlanStatus.ACTIVE, activePlan.getStatus());
    }

    // ---- Helper Methods ----

    private void registerAndVerify(String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", email, "password", password))))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        mockMvc.perform(get("/api/auth/verify")
                        .param("token", user.getVerificationToken()))
                .andExpect(status().isOk());
    }

    private String registerVerifyAndLogin(String email, String password) throws Exception {
        registerAndVerify(email, password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();

        Map<?, ?> responseMap = objectMapper.readValue(
                result.getResponse().getContentAsString(), Map.class);
        return (String) responseMap.get("token");
    }

    private void completeOnboarding(String jwt) throws Exception {
        Map<String, Object> onboardingRequest = Map.of(
                "fitnessGoal", "GENERAL_FITNESS",
                "experienceLevel", "BEGINNER",
                "daysPerWeek", 3,
                "sessionDurationMinutes", 45,
                "equipmentAccess", "FULL_GYM",
                "dietaryPreference", "NO_PREFERENCE",
                "heightCm", 175,
                "weightKg", 75,
                "age", 30,
                "goalDurationWeeks", 12
        );

        mockMvc.perform(post("/api/onboarding/submit")
                        .header("Authorization", "Bearer " + jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(onboardingRequest)))
                .andExpect(status().isCreated());
    }

    private void seedExerciseLibrary() {
        String[][] exercises = {
                {"Bench Press", "Chest", "BARBELL", "BEGINNER"},
                {"Dumbbell Fly", "Chest", "DUMBBELLS", "BEGINNER"},
                {"Incline Press", "Chest", "BARBELL", "BEGINNER"},
                {"Overhead Press", "Shoulders", "BARBELL", "BEGINNER"},
                {"Lateral Raise", "Shoulders", "DUMBBELLS", "BEGINNER"},
                {"Front Raise", "Shoulders", "DUMBBELLS", "BEGINNER"},
                {"Tricep Pushdown", "Triceps", "CABLE_MACHINE", "BEGINNER"},
                {"Tricep Dip", "Triceps", "NONE", "BEGINNER"},
                {"Barbell Row", "Back", "BARBELL", "BEGINNER"},
                {"Lat Pulldown", "Back", "CABLE_MACHINE", "BEGINNER"},
                {"Seated Row", "Back", "CABLE_MACHINE", "BEGINNER"},
                {"Dumbbell Curl", "Biceps", "DUMBBELLS", "BEGINNER"},
                {"Barbell Curl", "Biceps", "BARBELL", "BEGINNER"},
                {"Hammer Curl", "Biceps", "DUMBBELLS", "BEGINNER"},
                {"Barbell Squat", "Quadriceps", "BARBELL", "BEGINNER"},
                {"Leg Press", "Quadriceps", "FULL_GYM", "BEGINNER"},
                {"Leg Extension", "Quadriceps", "FULL_GYM", "BEGINNER"},
                {"Romanian Deadlift", "Hamstrings", "BARBELL", "BEGINNER"},
                {"Leg Curl", "Hamstrings", "FULL_GYM", "BEGINNER"},
                {"Stiff Leg Deadlift", "Hamstrings", "BARBELL", "BEGINNER"},
                {"Hip Thrust", "Glutes", "BARBELL", "BEGINNER"},
                {"Glute Bridge", "Glutes", "NONE", "BEGINNER"},
        };

        for (String[] ex : exercises) {
            ExerciseLibrary exercise = new ExerciseLibrary();
            exercise.setName(ex[0]);
            exercise.setMuscleGroup(ex[1]);
            exercise.setEquipmentRequired(EquipmentRequired.valueOf(ex[2]));
            exercise.setDifficulty(ExperienceLevel.valueOf(ex[3]));
            exerciseLibraryRepository.save(exercise);
        }
    }
}
