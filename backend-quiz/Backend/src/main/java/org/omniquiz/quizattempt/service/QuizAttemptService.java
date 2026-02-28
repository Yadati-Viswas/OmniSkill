package org.omniquiz.quizattempt.service;

import org.omniquiz.quizattempt.dto.QuizAttemptRequest;
import org.omniquiz.quizattempt.dto.QuizAttemptResponse;
import org.omniquiz.quizattempt.model.QuizAttempt;
import org.omniquiz.quizattempt.repository.QuizAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QuizAttemptService {

    private static final Logger logger = LoggerFactory.getLogger(QuizAttemptService.class);

    private final QuizAttemptRepository quizAttemptRepository;

    public QuizAttemptService(QuizAttemptRepository quizAttemptRepository) {
        this.quizAttemptRepository = quizAttemptRepository;
    }

    public QuizAttemptResponse saveAttempt(Long userId, QuizAttemptRequest request) {
        if (request.getScore() == null || request.getTotalQuestions() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score and totalQuestions are required.");
        }
        if (request.getTotalQuestions() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "totalQuestions must be greater than 0.");
        }
        if (request.getScore() < 0 || request.getScore() > request.getTotalQuestions()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "score must be between 0 and totalQuestions.");
        }

        String quizTitle = request.getQuizTitle() != null && !request.getQuizTitle().isBlank()
                ? request.getQuizTitle().trim()
                : "Untitled Quiz";

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(userId);
        attempt.setQuizId(request.getQuizId());
        attempt.setQuizTitle(quizTitle);
        attempt.setQuizType(request.getQuizType());
        attempt.setReferral(request.getReferral());
        attempt.setScore(request.getScore());
        attempt.setTotalQuestions(request.getTotalQuestions());
        attempt.setPercentage((request.getScore() * 100.0) / request.getTotalQuestions());

        QuizAttempt saved = quizAttemptRepository.save(attempt);
        logger.info("Saved quiz attempt. UserId: {}, AttemptId: {}, Score: {}/{}",
                userId, saved.getId(), saved.getScore(), saved.getTotalQuestions());
        return toResponse(saved);
    }

    public List<QuizAttemptResponse> getAttemptsByUserId(Long userId) {
        return quizAttemptRepository.findByUserIdOrderByAttemptedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private QuizAttemptResponse toResponse(QuizAttempt attempt) {
        return new QuizAttemptResponse(
                attempt.getId(),
                attempt.getQuizId(),
                attempt.getQuizTitle(),
                attempt.getQuizType(),
                attempt.getReferral(),
                attempt.getScore(),
                attempt.getTotalQuestions(),
                attempt.getPercentage(),
                attempt.getAttemptedAt()
        );
    }
}
