package org.omniquiz.quizattempt.dto;

import lombok.Data;

@Data
public class QuizAttemptRequest {
    private Long quizId;
    private String quizTitle;
    private String quizType;
    private String referral;
    private Integer score;
    private Integer totalQuestions;
}
