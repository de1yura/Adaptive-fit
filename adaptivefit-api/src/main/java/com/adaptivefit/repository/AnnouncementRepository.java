package com.adaptivefit.repository;

import com.adaptivefit.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByPinnedDescCreatedAtDesc();
}
