package org.omniquiz.interview.service;

import org.omniquiz.interview.model.Interview;
import org.omniquiz.interview.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);

    @Autowired
    private InterviewRepository interviewRepository;

    public Interview saveInterview(Interview interview) {
        logger.info("Saving interview for user: {}", interview.getUserId());
        return interviewRepository.save(interview);
    }

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAllByOrderByStartTimeDesc();
    }

    public List<Interview> getInterviewsByUserId(Long userId) {
        return interviewRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public Optional<Interview> getInterviewById(String id) {
        return interviewRepository.findById(id);
    }
}
