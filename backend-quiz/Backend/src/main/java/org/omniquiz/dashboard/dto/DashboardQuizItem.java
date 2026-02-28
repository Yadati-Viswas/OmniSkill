package org.omniquiz.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardQuizItem {
    private Long id;
    private String title;
    private String type;
    private String referral;
    private int questionCount;
    private LocalDateTime createdAt;
}
