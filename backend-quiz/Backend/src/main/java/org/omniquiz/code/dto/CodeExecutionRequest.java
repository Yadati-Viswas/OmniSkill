package org.omniquiz.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CodeExecutionRequest {
    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Source code is required")
    @Size(max = 20000, message = "Source code too large")
    private String sourceCode;

    private String stdin;

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public String getStdin() {
        return stdin;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }
}
