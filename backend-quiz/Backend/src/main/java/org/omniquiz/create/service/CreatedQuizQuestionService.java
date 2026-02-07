package org.omniquiz.create.service;

import jakarta.transaction.Transactional;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.quiz.model.QuizQuestion;
import org.omniquiz.quiz.repository.QuizRepository;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
public class CreatedQuizQuestionService {

    private static final Logger logger = LoggerFactory.getLogger(CreatedQuizQuestionService.class);

    @Autowired
    private QuizRepository quizRepository;

    @Transactional
    public QuizDTO saveQuiz(QuizDTO dto, User user) {
        logger.info("Saving created quiz: {}", dto.getTitle());
        Quiz quiz = new Quiz();
        quiz.setTitle(dto.getTitle());
        quiz.setReferral(dto.getReferral());
        quiz.setUser(user);
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setType(Quiz.QuizType.CREATED); // Set for create

        for (QuizDTO.QuestionDTO qDto : dto.getQuestions()) {
            QuizQuestion q = new QuizQuestion();
            q.setQuestion(qDto.getQuestion());
            q.setCode(qDto.getCode());
            q.setExplanation(qDto.getExplanation());
            q.setOptions(qDto.getOptions());
            q.setCorrectIndex(qDto.getCorrectIndex());
            q.setUser(user);
            quiz.addQuestion(q);
        }

        quiz = quizRepository.save(quiz);
        return toQuizDTO(quiz); // Reuse same mapper as generate
    }

    private QuizDTO toQuizDTO(Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setType(quiz.getType().name());
        dto.setReferral(quiz.getReferral());
        dto.setCreatorName(quiz.getUser().getFirstName() + " " + quiz.getUser().getLastName());
        return dto;
    }
}