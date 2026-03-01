package com.adaptivefit.controller;

import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
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

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    // ---- Registration Tests ----

    @Test
    void register_withValidData_returns201() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "test@example.com", "password", "password123"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").exists());

        Optional<User> user = userRepository.findByEmail("test@example.com");
        assertTrue(user.isPresent());
        assertFalse(user.get().isEmailVerified());
        assertNotNull(user.get().getVerificationToken());
    }

    @Test
    void register_withDuplicateEmail_returns400() throws Exception {
        // Register first user
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "dup@example.com", "password", "password123"))))
                .andExpect(status().isCreated());

        // Attempt duplicate registration
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "dup@example.com", "password", "password456"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    // ---- Login Before Verification Test ----

    @Test
    void login_beforeVerification_returns400() throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "unverified@example.com", "password", "password123"))))
                .andExpect(status().isCreated());

        // Attempt login without verifying
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "unverified@example.com", "password", "password123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Please verify your email before logging in"));
    }

    // ---- Verify then Login Test ----

    @Test
    void verify_thenLogin_returnsJwt() throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "verified@example.com", "password", "password123"))))
                .andExpect(status().isCreated());

        // Get verification token from DB
        User user = userRepository.findByEmail("verified@example.com").orElseThrow();
        String verificationToken = user.getVerificationToken();

        // Verify email
        mockMvc.perform(get("/api/auth/verify")
                        .param("token", verificationToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Email verified successfully"));

        // Confirm user is verified
        User verifiedUser = userRepository.findByEmail("verified@example.com").orElseThrow();
        assertTrue(verifiedUser.isEmailVerified());
        assertNull(verifiedUser.getVerificationToken());

        // Login
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "verified@example.com", "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.email").value("verified@example.com"))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andReturn();

        // Verify JWT is non-empty
        String responseBody = result.getResponse().getContentAsString();
        Map<?, ?> responseMap = objectMapper.readValue(responseBody, Map.class);
        assertNotNull(responseMap.get("token"));
        assertFalse(((String) responseMap.get("token")).isEmpty());
    }

    // ---- Wrong Password Test ----

    @Test
    void login_withWrongPassword_returns400() throws Exception {
        // Register and verify
        registerAndVerify("wrongpwd@example.com", "password123");

        // Login with wrong password
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("email", "wrongpwd@example.com", "password", "wrongpassword"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    // ---- Protected Endpoint Without JWT Test ----

    @Test
    void protectedEndpoint_withoutJwt_returns401() throws Exception {
        mockMvc.perform(get("/api/onboarding/profile"))
                .andExpect(status().isUnauthorized());
    }

    // ---- Protected Endpoint With Valid JWT Test ----

    @Test
    void protectedEndpoint_withValidJwt_doesNotReturn401() throws Exception {
        // Register, verify, and get JWT
        String jwt = registerVerifyAndLogin("authed@example.com", "password123");

        // Access protected endpoint with JWT — should not get 401
        // (may get 404 or other status depending on user state, but not 401)
        MvcResult result = mockMvc.perform(get("/api/onboarding/profile")
                        .header("Authorization", "Bearer " + jwt))
                .andReturn();

        assertNotEquals(401, result.getResponse().getStatus());
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
}
