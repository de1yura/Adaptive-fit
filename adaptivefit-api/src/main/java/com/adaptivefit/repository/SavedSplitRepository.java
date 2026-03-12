package com.adaptivefit.repository;

import com.adaptivefit.model.SavedSplit;
import com.adaptivefit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedSplitRepository extends JpaRepository<SavedSplit, Long> {

    List<SavedSplit> findByUserOrderByCreatedAtDesc(User user);

    void deleteByIdAndUser(Long id, User user);
}
