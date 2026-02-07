package org.omniquiz.join.controller;

import jakarta.validation.Valid;
import lombok.Data;
import org.omniquiz.join.service.JoinQuizService;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/v1-api/quiz")
public class JoinQuizController {

    private static final Logger logger = LoggerFactory.getLogger(JoinQuizController.class);

    @Autowired
    private JoinQuizService joinQuizService;

    @GetMapping("/join/{referral}")
    public ResponseEntity<QuizDTO> getQuizUsingReferral(@PathVariable String referral,
            @AuthenticationPrincipal User user) {
        logger.info("Request to join quiz. ReferralLength: {}, UserId: {}",
                referral != null ? referral.length() : 0,
                user != null ? user.getId() : null);
        QuizDTO dto = joinQuizService.getQuizQuestionsUsingReferral(referral);
        logger.info("Successfully joined quiz: '{}' (ID: {})", dto.getTitle(), dto.getId());
        return ResponseEntity.ok(dto);
    }

}
