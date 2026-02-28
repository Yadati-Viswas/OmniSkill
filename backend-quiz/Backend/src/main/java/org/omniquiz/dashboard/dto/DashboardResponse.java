package org.omniquiz.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.omniquiz.quizattempt.dto.QuizAttemptResponse;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private String username;
    private DashboardSummary summary;
    private List<DashboardQuizItem> createdQuizzes;
    private List<DashboardQuizItem> generatedQuizzes;
    private List<QuizAttemptResponse> attemptedQuizzes;
    private List<DashboardInterviewItem> interviews;
}
