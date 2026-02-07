package org.omniquiz.create.controller;

import jakarta.validation.Valid;
import org.omniquiz.quiz.dto.QuizDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.omniquiz.create.service.CreatedQuizQuestionService;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1-api/quiz")
public class CreatedQuizQuestionController {

    private static final Logger logger = LoggerFactory.getLogger(CreatedQuizQuestionController.class);

    @Autowired
    private CreatedQuizQuestionService createdQuizQuestionService;

    @PostMapping("/create")
    public ResponseEntity<QuizDTO> getCreateQuizQuestions(@Valid @RequestBody QuizDTO quizDTO,
            @AuthenticationPrincipal User user) {

        try {
            logger.info("Received request to create quiz. TitleLength: {}, UserId: {}",
                    quizDTO.getTitle() != null ? quizDTO.getTitle().length() : 0,
                    user != null ? user.getId() : null);
            quizDTO.setType("CREATED"); // Set type
            QuizDTO saved = createdQuizQuestionService.saveQuiz(quizDTO, user);
            logger.info("Quiz created successfully with ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error creating quiz: '{}'", quizDTO.getTitle(), e);
            return ResponseEntity.badRequest().build();
        }
    }
}
