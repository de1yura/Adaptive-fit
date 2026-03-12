package com.adaptivefit.controller;

import com.adaptivefit.exception.ForbiddenException;
import com.adaptivefit.exception.ResourceNotFoundException;
import com.adaptivefit.model.Announcement;
import com.adaptivefit.model.User;
import com.adaptivefit.repository.AnnouncementRepository;
import com.adaptivefit.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Announcements", description = "Public and admin announcement management")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final String adminEmail;

    public AnnouncementController(AnnouncementRepository announcementRepository,
                                  UserRepository userRepository,
                                  @Value("${app.admin.email}") String adminEmail) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
    }

    @GetMapping("/api/announcements")
    @Operation(summary = "List announcements", description = "Returns all announcements ordered by pinned status and date")
    public ResponseEntity<List<Announcement>> listAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByPinnedDescCreatedAtDesc();
        return ResponseEntity.ok(announcements);
    }

    @GetMapping("/api/admin/announcements")
    @Operation(summary = "Admin: list announcements", description = "Admin endpoint to list all announcements")
    public ResponseEntity<List<Announcement>> adminListAnnouncements(Authentication authentication) {
        checkAdmin(authentication);
        List<Announcement> announcements = announcementRepository.findAllByOrderByPinnedDescCreatedAtDesc();
        return ResponseEntity.ok(announcements);
    }

    @PostMapping("/api/admin/announcements")
    @Operation(summary = "Admin: create announcement", description = "Creates a new announcement (admin only)")
    public ResponseEntity<Announcement> createAnnouncement(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        checkAdmin(authentication);

        Announcement announcement = new Announcement();
        announcement.setTitle((String) body.get("title"));
        announcement.setContent((String) body.get("content"));
        if (body.containsKey("pinned")) {
            announcement.setPinned(Boolean.TRUE.equals(body.get("pinned")));
        }

        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/api/admin/announcements/{id}")
    @Operation(summary = "Admin: update announcement", description = "Updates an existing announcement (admin only)")
    public ResponseEntity<Announcement> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        checkAdmin(authentication);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        if (body.containsKey("title")) {
            announcement.setTitle((String) body.get("title"));
        }
        if (body.containsKey("content")) {
            announcement.setContent((String) body.get("content"));
        }
        if (body.containsKey("pinned")) {
            announcement.setPinned(Boolean.TRUE.equals(body.get("pinned")));
        }

        Announcement updated = announcementRepository.save(announcement);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/announcements/{id}")
    @Operation(summary = "Admin: delete announcement", description = "Deletes an announcement (admin only)")
    public ResponseEntity<Map<String, String>> deleteAnnouncement(
            @PathVariable Long id,
            Authentication authentication) {
        checkAdmin(authentication);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        announcementRepository.delete(announcement);
        return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
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
