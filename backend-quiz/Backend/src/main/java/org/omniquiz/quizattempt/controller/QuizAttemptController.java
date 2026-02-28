package org.omniquiz.quizattempt.controller;

import org.omniquiz.quizattempt.dto.QuizAttemptRequest;
import org.omniquiz.quizattempt.dto.QuizAttemptResponse;
import org.omniquiz.quizattempt.service.QuizAttemptService;
import org.omniquiz.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/v1-api/quiz/attempts")
public class QuizAttemptController {

    private static final Logger logger = LoggerFactory.getLogger(QuizAttemptController.class);

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(QuizAttemptService quizAttemptService) {
        this.quizAttemptService = quizAttemptService;
    }

    @PostMapping
    public ResponseEntity<QuizAttemptResponse> saveAttempt(
            @AuthenticationPrincipal User user,
            @RequestBody QuizAttemptRequest request) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required.");
        }
        logger.info("Saving quiz attempt. UserId: {}, QuizId: {}", user.getId(), request.getQuizId());
        QuizAttemptResponse response = quizAttemptService.saveAttempt(user.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<QuizAttemptResponse>> getMyAttempts(@AuthenticationPrincipal User user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required.");
        }
        List<QuizAttemptResponse> attempts = quizAttemptService.getAttemptsByUserId(user.getId());
        return ResponseEntity.ok(attempts);
    }
}
