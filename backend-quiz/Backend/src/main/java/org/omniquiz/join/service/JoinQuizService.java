package org.omniquiz.join.service;

import org.omniquiz.generate.service.GenerateQuizQuestionsService;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.quiz.model.QuizQuestion;
import org.omniquiz.quiz.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class JoinQuizService {

    private static final Logger logger = LoggerFactory.getLogger(JoinQuizService.class);

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private GenerateQuizQuestionsService generateQuizQuestionsService;

    public QuizDTO getQuizQuestionsUsingReferral(String referral) {
        logger.info("Attempting to join quiz. ReferralLength: {}", referral != null ? referral.length() : 0);
        Quiz quiz = quizRepository.findByReferral(referral);
        return generateQuizQuestionsService.toQuizDTO(quiz);
    }
}
