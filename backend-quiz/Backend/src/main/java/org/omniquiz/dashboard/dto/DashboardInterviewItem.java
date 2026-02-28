package org.omniquiz.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardInterviewItem {
    private String id;
    private String role;
    private String experienceLevel;
    private Long startTime;
    private Long endTime;
    private long durationMinutes;
    private int overallScore;
    private int totalResponses;
}
