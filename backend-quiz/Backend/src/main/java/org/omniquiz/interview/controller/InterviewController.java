package org.omniquiz.interview.controller;

import org.omniquiz.interview.dto.InterviewFeedbackRequest;
import org.omniquiz.interview.dto.InterviewFeedbackResponse;
import org.omniquiz.interview.dto.ResumeParseResponse;
import org.omniquiz.interview.model.Interview;
import org.omniquiz.interview.service.InterviewFeedbackService;
import org.omniquiz.interview.service.InterviewService;
import org.omniquiz.user.model.User;
import org.omniquiz.interview.service.ResumeParsingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1-api/interviews")
public class InterviewController {

    private static final Logger logger = LoggerFactory.getLogger(InterviewController.class);

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private ResumeParsingService resumeParsingService;

    @Autowired
    private InterviewFeedbackService interviewFeedbackService;

    @PostMapping
    public ResponseEntity<Map<String, String>> saveInterview(
            @RequestBody Interview interview,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required.");
        }
        interview.setUserId(user.getId());
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
    public ResponseEntity<List<Interview>> getAllInterviews(@AuthenticationPrincipal User user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required.");
        }
        logger.info("Fetching interviews for userId: {}", user.getId());
        List<Interview> interviews = interviewService.getInterviewsByUserId(user.getId());
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        if (user == null || user.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User authentication required.");
        }
        logger.info("Fetching interview with ID: {}", id);
        return interviewService.getInterviewById(id)
                .filter(interview -> user.getId().equals(interview.getUserId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/resume/parse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeParseResponse> parseResume(@RequestParam("resume") MultipartFile resume) {
        logger.info("Parsing resume for interview. File: {}", resume.getOriginalFilename());
        ResumeParseResponse response = resumeParsingService.parseResume(resume);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedback")
    public ResponseEntity<InterviewFeedbackResponse> generateFeedback(@RequestBody InterviewFeedbackRequest request) {
        String interviewId = request.getInterviewId() != null ? request.getInterviewId() : "unknown";
        logger.info("Generating interview feedback for interview ID: {}", interviewId);
        InterviewFeedbackResponse response = interviewFeedbackService.generateFeedback(request);
        return ResponseEntity.ok(response);
    }
}
