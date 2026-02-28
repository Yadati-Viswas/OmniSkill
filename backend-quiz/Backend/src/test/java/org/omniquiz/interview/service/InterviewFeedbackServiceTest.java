package org.omniquiz.interview.service;

import org.junit.jupiter.api.Test;
import org.omniquiz.interview.dto.InterviewFeedbackRequest;
import org.omniquiz.interview.dto.InterviewFeedbackResponse;
import org.omniquiz.interview.model.InterviewConfig;
import org.omniquiz.interview.model.TranscriptEntry;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class InterviewFeedbackServiceTest {

    private final InterviewFeedbackService service = new InterviewFeedbackService();

    @Test
    void shouldGenerateFeedbackForValidTranscript() {
        InterviewFeedbackRequest request = new InterviewFeedbackRequest(
                "int-1",
                new InterviewConfig(
                        "Backend Engineer",
                        "Build scalable APIs and optimize database performance",
                        "Mid",
                        "resume.pdf",
                        "Built REST APIs with Java and Spring Boot. Improved latency by 35 percent."
                ),
                List.of(
                        new TranscriptEntry("ai", "Tell me about a backend project you led?", 1L),
                        new TranscriptEntry("user", "I designed a Spring Boot service with PostgreSQL and caching. First I profiled bottlenecks, then reduced latency by 35 percent.", 2L),
                        new TranscriptEntry("ai", "How do you handle API failures?", 3L),
                        new TranscriptEntry("user", "I add retry with backoff, fallback responses, and structured monitoring alerts.", 4L)
                ),
                1_000L,
                181_000L
        );

        InterviewFeedbackResponse response = service.generateFeedback(request);

        assertNotNull(response);
        assertEquals("int-1", response.getInterviewId());
        assertEquals(4, response.getMetrics().size());
        assertTrue(response.getOverallScore() >= 0 && response.getOverallScore() <= 100);
        assertFalse(response.getStrengths().isEmpty());
        assertFalse(response.getImprovementTips().isEmpty());
    }

    @Test
    void shouldHandleEmptyTranscriptGracefully() {
        InterviewFeedbackRequest request = new InterviewFeedbackRequest(
                "int-2",
                new InterviewConfig("Frontend Engineer", "", "Entry", null, null),
                List.of(),
                1_000L,
                2_000L
        );

        InterviewFeedbackResponse response = service.generateFeedback(request);

        assertNotNull(response);
        assertEquals("int-2", response.getInterviewId());
        assertEquals(4, response.getMetrics().size());
        assertTrue(response.getWeaknesses().size() >= 1);
    }
}
