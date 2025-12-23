package org.omniquiz.quiz.repository;

import org.omniquiz.quiz.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Quiz findByReferral(String referral);
    List<Quiz> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, Quiz.QuizType type);
}