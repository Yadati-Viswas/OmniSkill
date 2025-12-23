package org.omniquiz.generate.controller;

import org.omniquiz.quiz.dto.GenerateQuizRequest;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.generate.service.GenerateQuizQuestionsService;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1-api/quiz")
public class GenerateQuizQuestionsController {

    @Autowired
    private GenerateQuizQuestionsService generateQuizQuestionsService;

    @PostMapping("/generate-questions")
    public ResponseEntity<QuizDTO> generateQuizQuestions( @RequestBody GenerateQuizRequest request, @AuthenticationPrincipal User user) {

        String prompt = request.getPrompt();
        String referral = request.getReferral(); // Optional
        System.out.println("Referral code"+referral);
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        System.out.println("Original Prompt: " + prompt);

        Pattern pattern = Pattern.compile("Generate\\s+(\\d+)\\s+multiple-choice\\b", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(prompt);
        int totalQuestions = 5;
        if (matcher.find()) {
            totalQuestions = Integer.parseInt(matcher.group(1));
            if (totalQuestions <= 0) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            System.out.println("Regex failed to match prompt: " + prompt);
            return ResponseEntity.badRequest().build();
        }

        List<QuizDTO.QuestionDTO> questions = generateQuizQuestionsService.generateAllQuestions(prompt, totalQuestions);
        System.out.println("All Questions generated size: "+questions.size());
        QuizDTO dto = new QuizDTO();
        dto.setTitle("Generated Quiz: " + prompt.substring(0, Math.min(20, prompt.length()))); // Auto-title
        dto.setReferral(referral);
        dto.setQuestions(questions);
        dto.setType(Quiz.QuizType.GENERATED.name());
        QuizDTO saved = generateQuizQuestionsService.saveQuiz(dto, user);
        return ResponseEntity.ok(saved);
    }

}