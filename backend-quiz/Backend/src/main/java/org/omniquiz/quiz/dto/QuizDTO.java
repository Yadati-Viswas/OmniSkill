package org.omniquiz.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuizDTO {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title too long")
    private String title;

    private String referral;

    @NotEmpty(message = "At least one question is required")
    private List<QuestionDTO> questions;

    private Long id;
    private String type;
    private String creatorName;

    @Data
    public static class QuestionDTO {
        @NotBlank
        private String question;

        private String code;

        @NotBlank
        private String explanation;

        @NotEmpty
        @Size(min = 2, max = 6, message = "Options must be 2–6")
        private List<String> options;

        @NotBlank
        private Integer correctIndex;  // Unified: 0 for first option, etc.
    }
}