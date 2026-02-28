package org.omniquiz.dashboard.service;

import jakarta.transaction.Transactional;
import org.omniquiz.dashboard.dto.*;
import org.omniquiz.interview.dto.InterviewFeedbackRequest;
import org.omniquiz.interview.dto.InterviewFeedbackResponse;
import org.omniquiz.interview.model.Interview;
import org.omniquiz.interview.service.InterviewFeedbackService;
import org.omniquiz.interview.service.InterviewService;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.quiz.repository.QuizRepository;
import org.omniquiz.quizattempt.dto.QuizAttemptResponse;
import org.omniquiz.quizattempt.service.QuizAttemptService;
import org.omniquiz.user.model.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final QuizRepository quizRepository;
    private final QuizAttemptService quizAttemptService;
    private final InterviewService interviewService;
    private final InterviewFeedbackService interviewFeedbackService;

    public DashboardService(QuizRepository quizRepository,
                            QuizAttemptService quizAttemptService,
                            InterviewService interviewService,
                            InterviewFeedbackService interviewFeedbackService) {
        this.quizRepository = quizRepository;
        this.quizAttemptService = quizAttemptService;
        this.interviewService = interviewService;
        this.interviewFeedbackService = interviewFeedbackService;
    }

    @Transactional
    public DashboardResponse getDashboardForUser(User user) {
        Long userId = user.getId();

        List<Quiz> createdQuizzes = quizRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, Quiz.QuizType.CREATED);
        List<Quiz> generatedQuizzes = quizRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, Quiz.QuizType.GENERATED);
        List<QuizAttemptResponse> attemptedQuizzes = quizAttemptService.getAttemptsByUserId(userId);
        List<Interview> interviews = interviewService.getInterviewsByUserId(userId);

        List<DashboardQuizItem> createdQuizItems = createdQuizzes.stream()
                .map(this::toQuizItem)
                .toList();
        List<DashboardQuizItem> generatedQuizItems = generatedQuizzes.stream()
                .map(this::toQuizItem)
                .toList();

        List<DashboardInterviewItem> interviewItems = interviews.stream()
                .map(this::toInterviewItem)
                .toList();

        double avgQuizScore = averageQuizScore(attemptedQuizzes);
        double avgInterviewScore = averageInterviewScore(interviewItems);
        int overallRating = calculateOverallRating(avgQuizScore, avgInterviewScore,
                attemptedQuizzes.size(), interviewItems.size());

        DashboardSummary summary = new DashboardSummary(
                createdQuizItems.size(),
                generatedQuizItems.size(),
                attemptedQuizzes.size(),
                interviewItems.size(),
                round2(avgQuizScore),
                round2(avgInterviewScore),
                overallRating,
                ratingLabel(overallRating)
        );

        return new DashboardResponse(
                user.getUsername(),
                summary,
                createdQuizItems,
                generatedQuizItems,
                attemptedQuizzes,
                interviewItems
        );
    }

    private DashboardQuizItem toQuizItem(Quiz quiz) {
        int questionCount = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;
        return new DashboardQuizItem(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getType() != null ? quiz.getType().name() : null,
                quiz.getReferral(),
                questionCount,
                quiz.getCreatedAt()
        );
    }

    private DashboardInterviewItem toInterviewItem(Interview interview) {
        InterviewFeedbackResponse feedback = interviewFeedbackService.generateFeedback(new InterviewFeedbackRequest(
                interview.getId(),
                interview.getConfig(),
                interview.getTranscript(),
                interview.getStartTime(),
                interview.getEndTime()
        ));

        return new DashboardInterviewItem(
                interview.getId(),
                interview.getConfig() != null ? interview.getConfig().getRole() : "Unknown Role",
                interview.getConfig() != null ? interview.getConfig().getExperienceLevel() : "Mid",
                interview.getStartTime(),
                interview.getEndTime(),
                feedback.getDurationMinutes(),
                feedback.getOverallScore(),
                feedback.getTotalQuestionsAnswered()
        );
    }

    private double averageQuizScore(List<QuizAttemptResponse> attempts) {
        if (attempts.isEmpty()) return 0;
        return attempts.stream()
                .map(QuizAttemptResponse::getPercentage)
                .filter(value -> value != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0);
    }

    private double averageInterviewScore(List<DashboardInterviewItem> interviews) {
        if (interviews.isEmpty()) return 0;
        return interviews.stream()
                .mapToInt(DashboardInterviewItem::getOverallScore)
                .average()
                .orElse(0);
    }

    private int calculateOverallRating(double avgQuizScore, double avgInterviewScore,
                                       int attemptCount, int interviewCount) {
        double baseScore;
        if (avgQuizScore > 0 && avgInterviewScore > 0) {
            baseScore = (avgQuizScore * 0.55) + (avgInterviewScore * 0.45);
        } else if (avgQuizScore > 0) {
            baseScore = avgQuizScore;
        } else if (avgInterviewScore > 0) {
            baseScore = avgInterviewScore;
        } else {
            baseScore = 0;
        }

        double activityBonus = Math.min(10.0, (attemptCount + interviewCount) * 1.2);
        int rating = (int) Math.round(baseScore + activityBonus);
        return Math.max(0, Math.min(100, rating));
    }

    private String ratingLabel(int rating) {
        if (rating >= 85) return "Elite";
        if (rating >= 70) return "Strong";
        if (rating >= 55) return "Growing";
        if (rating > 0) return "Starter";
        return "No Data";
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
