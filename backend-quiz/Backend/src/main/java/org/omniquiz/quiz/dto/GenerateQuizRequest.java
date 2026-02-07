package org.omniquiz.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class GenerateQuizRequest {
    @NotBlank(message = "Prompt is required")
    @Size(min = 10, max = 1000, message = "Prompt must be between 10 and 1000 characters")
    private String prompt;

    private String referral; // Optional, generated if null
}
