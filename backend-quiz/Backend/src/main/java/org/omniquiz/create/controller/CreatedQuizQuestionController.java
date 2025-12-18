package org.omniquiz.create.controller;

import jakarta.validation.Valid;
import org.omniquiz.quiz.dto.QuizDTO;
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

    @Autowired
    private CreatedQuizQuestionService createdQuizQuestionService;

    @PostMapping("/create")
    public ResponseEntity<QuizDTO> getCreateQuizQuestions( @Valid @RequestBody QuizDTO quizDTO, @AuthenticationPrincipal User user) {

        try {
            System.out.println(quizDTO.getTitle());
            quizDTO.setType("CREATED");  // Set type
            QuizDTO saved = createdQuizQuestionService.saveQuiz(quizDTO, user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}