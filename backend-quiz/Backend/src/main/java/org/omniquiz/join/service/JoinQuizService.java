package org.omniquiz.join.service;

import org.omniquiz.generate.service.GenerateQuizQuestionsService;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.quiz.model.QuizQuestion;
import org.omniquiz.quiz.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class JoinQuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private GenerateQuizQuestionsService generateQuizQuestionsService;

    public QuizDTO getQuizQuestionsUsingReferral(String referral) {
        Quiz quiz = quizRepository.findByReferral(referral);
        return generateQuizQuestionsService.toQuizDTO(quiz);
    }
}
