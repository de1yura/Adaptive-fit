package com.adaptivefit.controller;

import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.SavedSplit;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.SavedSplitRepository;
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
@RequestMapping("/api/saved-splits")
@Tag(name = "Saved Splits", description = "Manage saved workout splits")
public class SavedSplitController {

    private final SavedSplitRepository savedSplitRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public SavedSplitController(SavedSplitRepository savedSplitRepository,
                                UserRepository userRepository,
                                ObjectMapper objectMapper) {
        this.savedSplitRepository = savedSplitRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @Operation(summary = "List saved splits", description = "Returns all saved workout splits for the authenticated user")
    public ResponseEntity<List<SavedSplit>> listSavedSplits(Authentication authentication) {
        User user = getUser(authentication);
        List<SavedSplit> splits = savedSplitRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(splits);
    }

    @PostMapping
    @Operation(summary = "Create saved split", description = "Creates a new saved workout split")
    public ResponseEntity<SavedSplit> createSavedSplit(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        User user = getUser(authentication);

        SavedSplit split = new SavedSplit();
        split.setUser(user);
        split.setName((String) body.get("name"));

        Object days = body.get("days");
        if (days instanceof String) {
            split.setDays((String) days);
        } else {
            try {
                split.setDays(objectMapper.writeValueAsString(days));
            } catch (JsonProcessingException e) {
                throw new com.adaptivefit.exception.BadRequestException("Invalid days JSON");
            }
        }

        SavedSplit saved = savedSplitRepository.save(split);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    @Operation(summary = "Delete saved split", description = "Deletes a saved split owned by the authenticated user")
    public ResponseEntity<Map<String, String>> deleteSavedSplit(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getUser(authentication);
        SavedSplit split = savedSplitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved split not found"));

        if (!split.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Saved split not found");
        }

        savedSplitRepository.delete(split);
        return ResponseEntity.ok(Map.of("message", "Saved split deleted successfully"));
    }

    private User getUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
