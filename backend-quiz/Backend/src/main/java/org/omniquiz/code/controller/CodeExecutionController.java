package org.omniquiz.code.controller;

import jakarta.validation.Valid;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;
import org.omniquiz.code.dto.CodeSubmissionRequest;
import org.omniquiz.code.dto.CodeSubmissionResponse;
import org.omniquiz.code.service.CodeExecutionService;
import org.omniquiz.code.service.CodeSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1-api/code")
public class CodeExecutionController {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionController.class);

    private final CodeExecutionService codeExecutionService;
    private final CodeSubmissionService codeSubmissionService;

    public CodeExecutionController(CodeExecutionService codeExecutionService,
                                   CodeSubmissionService codeSubmissionService) {
        this.codeExecutionService = codeExecutionService;
        this.codeSubmissionService = codeSubmissionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> execute(@Valid @RequestBody CodeExecutionRequest request) {
        logger.info("Received code execution request for language: {}", request.getLanguage());
        CodeExecutionResponse response = codeExecutionService.execute(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit")
    public ResponseEntity<CodeSubmissionResponse> submit(@Valid @RequestBody CodeSubmissionRequest request) {
        logger.info("Received code submission for problem: {}, language: {}", request.getProblemId(),
                request.getLanguage());
        CodeSubmissionResponse response = codeSubmissionService.submit(request);
        return ResponseEntity.ok(response);
    }
}
