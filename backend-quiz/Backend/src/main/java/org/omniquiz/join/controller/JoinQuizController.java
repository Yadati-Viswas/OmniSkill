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

@RestController
@RequestMapping("/v1-api/quiz")
public class JoinQuizController {

    @Autowired
    private JoinQuizService joinQuizService;

    @GetMapping("/join/{referral}")
    public ResponseEntity<QuizDTO> getQuizUsingReferral(@PathVariable String referral, @AuthenticationPrincipal User user) {
        System.out.println("Referral code: "+referral);
        System.out.println("User " + user.getUsername());
        QuizDTO dto = joinQuizService.getQuizQuestionsUsingReferral(referral);
        return ResponseEntity.ok(dto);
    }

}