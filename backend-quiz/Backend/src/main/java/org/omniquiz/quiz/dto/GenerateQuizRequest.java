package org.omniquiz.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateQuizRequest {
    @NotBlank(message = "Prompt is required")
    private String prompt;

    private String referral; // Optional, generated if null
}