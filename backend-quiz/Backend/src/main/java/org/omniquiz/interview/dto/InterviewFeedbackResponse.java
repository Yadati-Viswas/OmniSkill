package org.omniquiz.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackResponse {
    private String interviewId;
    private String role;
    private String experienceLevel;
    private int overallScore;
    private long durationMinutes;
    private int totalQuestionsAnswered;
    private String summary;
    private List<InterviewFeedbackMetric> metrics;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> improvementTips;
    private List<String> practicePlan;
}
