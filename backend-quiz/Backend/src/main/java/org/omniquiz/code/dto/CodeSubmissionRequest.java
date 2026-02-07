package org.omniquiz.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CodeSubmissionRequest {
    @NotBlank(message = "Language is required")
    private String language;

    @NotBlank(message = "Source code is required")
    @Size(max = 20000, message = "Source code too large")
    private String sourceCode;

    @NotNull(message = "Problem ID is required")
    private Long problemId;

    private List<TestCaseDTO> testCases;

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

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public List<TestCaseDTO> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCaseDTO> testCases) {
        this.testCases = testCases;
    }
}
