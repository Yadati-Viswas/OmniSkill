package org.omniquiz.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private int quizzesCreated;
    private int quizzesGenerated;
    private int quizzesAttempted;
    private int interviewsTaken;
    private double avgQuizScore;
    private double avgInterviewScore;
    private int overallRating;
    private String ratingLabel;
}
