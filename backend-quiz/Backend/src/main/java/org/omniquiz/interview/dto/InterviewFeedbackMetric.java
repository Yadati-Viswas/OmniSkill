package org.omniquiz.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackMetric {
    private String name;
    private int score;
    private String insight;
}
