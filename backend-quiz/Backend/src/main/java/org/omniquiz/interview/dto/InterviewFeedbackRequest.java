package org.omniquiz.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.omniquiz.interview.model.InterviewConfig;
import org.omniquiz.interview.model.TranscriptEntry;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackRequest {
    private String interviewId;
    private InterviewConfig config;
    private List<TranscriptEntry> transcript;
    private Long startTime;
    private Long endTime;
}
