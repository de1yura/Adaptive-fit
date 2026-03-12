package com.adaptivefit.controller;

import com.adaptivefit.exception.BadRequestException;
import com.adaptivefit.exception.ForbiddenException;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.NutritionLogRepository;
import com.adaptivefit.repository.UserRepository;
import com.adaptivefit.repository.WorkoutLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Users", description = "Admin user management and platform statistics")
public class AdminUserController {

    private final UserRepository userRepository;
    private final WorkoutLogRepository workoutLogRepository;
    private final NutritionLogRepository nutritionLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;

    public AdminUserController(UserRepository userRepository,
                               WorkoutLogRepository workoutLogRepository,
                               NutritionLogRepository nutritionLogRepository,
                               PasswordEncoder passwordEncoder,
                               @Value("${app.admin.email}") String adminEmail) {
        this.userRepository = userRepository;
        this.workoutLogRepository = workoutLogRepository;
        this.nutritionLogRepository = nutritionLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get platform stats", description = "Returns platform-wide statistics including user and content counts")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        checkAdmin(authentication);

        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.countByEmailVerifiedTrue();
        long totalWorkouts = workoutLogRepository.count();
        long totalNutritionLogs = nutritionLogRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("totalWorkouts", totalWorkouts);
        stats.put("totalNutritionLogs", totalNutritionLogs);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Returns all users with their workout and check-in counts")
    public ResponseEntity<List<Map<String, Object>>> listUsers(Authentication authentication) {
        checkAdmin(authentication);

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> userMap = new LinkedHashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("email", user.getEmail());
                    userMap.put("emailVerified", user.isEmailVerified());
                    userMap.put("admin", user.isAdmin());
                    userMap.put("createdAt", user.getCreatedAt());
                    userMap.put("workoutCount", workoutLogRepository.countByUserId(user.getId()));
                    return userMap;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(userList);
    }

    @PostMapping("/users")
    @Operation(summary = "Create user", description = "Creates a new user account (admin only)")
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        checkAdmin(authentication);

        String email = (String) body.get("email");
        String password = (String) body.get("password");

        if (email == null || password == null) {
            throw new BadRequestException("Email and password are required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("User with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmailVerified(true);

        if (body.containsKey("isAdmin")) {
            user.setAdmin(Boolean.TRUE.equals(body.get("isAdmin")));
        }

        User saved = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("email", saved.getEmail());
        response.put("admin", saved.isAdmin());
        response.put("message", "User created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/users/{id}")
    @Operation(summary = "Update user", description = "Updates a user's admin status or password (admin only)")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        checkAdmin(authentication);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (body.containsKey("isAdmin")) {
            user.setAdmin(Boolean.TRUE.equals(body.get("isAdmin")));
        }
        if (body.containsKey("password")) {
            String newPassword = (String) body.get("password");
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        User updated = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", updated.getId());
        response.put("email", updated.getEmail());
        response.put("admin", updated.isAdmin());
        response.put("message", "User updated successfully");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    @Operation(summary = "Delete user", description = "Deletes a user and all associated data (admin only)")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        checkAdmin(authentication);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    private void checkAdmin(Authentication authentication) {
        String email = authentication.getName();
        if (!adminEmail.equals(email)) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null || !user.isAdmin()) {
                throw new ForbiddenException("Admin access required");
            }
        }
    }
}
