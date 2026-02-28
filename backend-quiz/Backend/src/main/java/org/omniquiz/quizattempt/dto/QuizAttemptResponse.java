package org.omniquiz.quizattempt.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttemptResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private String quizType;
    private String referral;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private LocalDateTime attemptedAt;
}
