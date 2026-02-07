package org.omniquiz.code.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;
import org.omniquiz.code.dto.CodeSubmissionRequest;
import org.omniquiz.code.dto.CodeSubmissionResponse;
import org.omniquiz.code.dto.TestCaseDTO;
import org.omniquiz.codingproblems.model.Problem;
import org.omniquiz.codingproblems.repository.ProblemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class CodeSubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeSubmissionService.class);

    private final CodeExecutionService executionService;
    private final ProblemRepository problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CodeSubmissionService(CodeExecutionService executionService, ProblemRepository problemRepository) {
        this.executionService = executionService;
        this.problemRepository = problemRepository;
    }

    public CodeSubmissionResponse submit(CodeSubmissionRequest request) {
        List<TestCaseDTO> testCases = resolveTestCases(request);
        if (testCases.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No test cases found");
        }

        CodeSubmissionResponse response = new CodeSubmissionResponse();
        response.setTotalCount(testCases.size());

        int passed = 0;
        List<CodeSubmissionResponse.TestCaseResult> results = new ArrayList<>();

        for (int i = 0; i < testCases.size(); i++) {
            TestCaseDTO testCase = testCases.get(i);
            String stdin = buildStdin(testCase.getInput());
            CodeExecutionRequest execReq = new CodeExecutionRequest();
            execReq.setLanguage(request.getLanguage());
            execReq.setSourceCode(request.getSourceCode());
            execReq.setStdin(stdin);

            CodeSubmissionResponse.TestCaseResult result = new CodeSubmissionResponse.TestCaseResult();
            result.setIndex(i + 1);
            String expectedStr = normalizeExpected(testCase.getExpected_output());
            result.setExpected(expectedStr);

            try {
                CodeExecutionResponse execResp = executionService.execute(execReq);
                String actual = normalizeActual(execResp);
                result.setActual(actual);

                String stderr = execResp.getStderr();
                String compile = execResp.getCompileOutput();
                String status = execResp.getStatus() != null ? execResp.getStatus().getDescription() : null;

                if (status != null && !status.isBlank() && !"Accepted".equalsIgnoreCase(status)) {
                    result.setError("Status: " + status);
                }
                if (compile != null && !compile.isBlank()) {
                    result.setError("Compile Output: " + compile.trim());
                }
                if (stderr != null && !stderr.isBlank()) {
                    result.setError("Stderr: " + stderr.trim());
                }

                boolean ok = compare(expectedStr, actual)
                        && (stderr == null || stderr.isBlank())
                        && (compile == null || compile.isBlank())
                        && (status == null || "Accepted".equalsIgnoreCase(status));
                result.setPassed(ok);
                if (ok) {
                    passed++;
                }
            } catch (Exception e) {
                logger.error("Execution failed for test case {}", i + 1, e);
                result.setPassed(false);
                result.setError(e.getMessage());
            }

            results.add(result);
        }

        response.setPassedCount(passed);
        response.setAllPassed(passed == testCases.size());
        response.setResults(results);
        return response;
    }

    private List<TestCaseDTO> resolveTestCases(CodeSubmissionRequest request) {
        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            return request.getTestCases();
        }

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Problem not found"));
        if (problem.getTestCases() == null) {
            return List.of();
        }

        try {
            if (problem.getTestCases() instanceof String testCaseJson) {
                return objectMapper.readValue(testCaseJson, new TypeReference<List<TestCaseDTO>>() {});
            }
            return objectMapper.convertValue(problem.getTestCases(), new TypeReference<List<TestCaseDTO>>() {});
        } catch (Exception e) {
            logger.error("Failed to parse test cases for problem {}", problem.getId(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid test cases format");
        }
    }

    private String buildStdin(Map<String, Object> input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        // Use JSON to align with example inputs like {"n":2}
        try {
            return objectMapper.writeValueAsString(input);
        } catch (Exception e) {
            logger.warn("Failed to serialize stdin input, falling back to string values", e);
            StringBuilder sb = new StringBuilder();
            for (Object value : input.values()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append(String.valueOf(value));
            }
            return sb.toString();
        }
    }

    private String normalizeExpected(Object expected) {
        if (expected == null) return "";
        if (expected instanceof String str) return str.trim();
        try {
            return objectMapper.writeValueAsString(expected).trim();
        } catch (Exception e) {
            return String.valueOf(expected).trim();
        }
    }

    private String normalizeActual(CodeExecutionResponse execResp) {
        if (execResp == null) return "";
        String stdout = execResp.getStdout();
        if (stdout == null) return "";
        return stdout.trim();
    }

    private boolean compare(String expected, String actual) {
        if (Objects.equals(expected, actual)) {
            return true;
        }
        // Try JSON comparison if both look like JSON
        try {
            Object expObj = objectMapper.readValue(expected, Object.class);
            Object actObj = objectMapper.readValue(actual, Object.class);
            return Objects.equals(expObj, actObj);
        } catch (Exception e) {
            return false;
        }
    }
}
