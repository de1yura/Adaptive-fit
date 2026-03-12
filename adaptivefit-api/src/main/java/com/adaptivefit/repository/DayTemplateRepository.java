package com.adaptivefit.repository;

import com.adaptivefit.model.DayTemplate;
import com.adaptivefit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayTemplateRepository extends JpaRepository<DayTemplate, Long> {

    List<DayTemplate> findByUserOrderByCreatedAtDesc(User user);

    void deleteByIdAndUser(Long id, User user);
}
