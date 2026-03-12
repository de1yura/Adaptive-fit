package com.adaptivefit.controller;

import com.adaptivefit.dto.request.ChangePasswordRequest;
import com.adaptivefit.dto.request.ForgotPasswordRequest;
import com.adaptivefit.dto.request.LoginRequest;
import com.adaptivefit.dto.request.RegisterRequest;
import com.adaptivefit.dto.request.ResetPasswordRequest;
import com.adaptivefit.dto.response.AuthResponse;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration, login, and password management")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and sends a verification email")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request.getEmail(), request.getPassword());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify email address", description = "Verifies a user's email address using the token sent via email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in", description = "Authenticates a user and returns a JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        boolean isAdmin = user != null && user.isAdmin();
        return ResponseEntity.ok(new AuthResponse(token, request.getEmail(), "Login successful", isAdmin));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Sends a password reset email to the specified address")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets the user's password using a valid reset token")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Changes the authenticated user's password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        authService.changePassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
