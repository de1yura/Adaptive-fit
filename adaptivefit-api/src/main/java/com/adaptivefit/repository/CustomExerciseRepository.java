package com.adaptivefit.repository;

import com.adaptivefit.model.CustomExercise;
import com.adaptivefit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomExerciseRepository extends JpaRepository<CustomExercise, Long> {

    List<CustomExercise> findByUserOrderByCreatedAtDesc(User user);

    void deleteByIdAndUser(Long id, User user);
}
