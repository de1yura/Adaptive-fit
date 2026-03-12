package com.adaptivefit.controller;

import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.DayTemplate;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.DayTemplateRepository;
import com.adaptivefit.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/day-templates")
@Tag(name = "Day Templates", description = "Manage workout day templates")
public class DayTemplateController {

    private final DayTemplateRepository dayTemplateRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public DayTemplateController(DayTemplateRepository dayTemplateRepository,
                                 UserRepository userRepository,
                                 ObjectMapper objectMapper) {
        this.dayTemplateRepository = dayTemplateRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @Operation(summary = "List day templates", description = "Returns all day templates for the authenticated user")
    public ResponseEntity<List<DayTemplate>> listDayTemplates(Authentication authentication) {
        User user = getUser(authentication);
        List<DayTemplate> templates = dayTemplateRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(templates);
    }

    @PostMapping
    @Operation(summary = "Create day template", description = "Creates a new workout day template")
    public ResponseEntity<DayTemplate> createDayTemplate(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        User user = getUser(authentication);

        DayTemplate template = new DayTemplate();
        template.setUser(user);
        template.setName((String) body.get("name"));

        Object exercises = body.get("exercises");
        if (exercises instanceof String) {
            template.setExercises((String) exercises);
        } else {
            try {
                template.setExercises(objectMapper.writeValueAsString(exercises));
            } catch (JsonProcessingException e) {
                throw new com.adaptivefit.exception.BadRequestException("Invalid exercises JSON");
            }
        }

        DayTemplate saved = dayTemplateRepository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "Delete day template", description = "Deletes a day template owned by the authenticated user")
    public ResponseEntity<Map<String, String>> deleteDayTemplate(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUser(authentication);
        DayTemplate template = dayTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Day template not found"));

        if (!template.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Day template not found");
        }

        dayTemplateRepository.delete(template);
        return ResponseEntity.ok(Map.of("message", "Day template deleted successfully"));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
