package org.omniquiz.interview.controller;

import org.omniquiz.interview.model.Interview;
import org.omniquiz.interview.service.InterviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1-api/interviews")
public class InterviewController {

    private static final Logger logger = LoggerFactory.getLogger(InterviewController.class);

    @Autowired
    private InterviewService interviewService;

    @PostMapping
    public ResponseEntity<Map<String, String>> saveInterview(@RequestBody Interview interview) {
        if (interview.getConfig() != null) {
            logger.info("Saving interview. Role: {}, Experience: {}", interview.getConfig().getRole(),
                    interview.getConfig().getExperienceLevel());
        } else {
            logger.info("Saving interview with no config.");
        }
        Interview saved = interviewService.saveInterview(interview);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Interview saved successfully");
        response.put("id", saved.getId());
        logger.info("Interview saved with ID: {}", saved.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Interview>> getAllInterviews() {
        logger.info("Fetching all interviews");
        List<Interview> interviews = interviewService.getAllInterviews();
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(@PathVariable String id) {
        logger.info("Fetching interview with ID: {}", id);
        return interviewService.getInterviewById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
