package org.omniquiz.quizattempt.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempt")
@Data
@NoArgsConstructor
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "quiz_title", nullable = false)
    private String quizTitle;

    @Column(name = "quiz_type")
    private String quizType;

    @Column(name = "referral")
    private String referral;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "percentage", nullable = false)
    private Double percentage;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt = LocalDateTime.now();

    @Column(name = "user_id", nullable = false)
    private Long userId;
}
