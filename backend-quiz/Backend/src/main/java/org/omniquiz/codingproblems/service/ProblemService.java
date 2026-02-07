package org.omniquiz.codingproblems.service;

import java.util.Optional;

import org.omniquiz.codingproblems.model.Problem;
import org.omniquiz.codingproblems.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProblemService {

    private static final Logger logger = LoggerFactory.getLogger(ProblemService.class);

    @Autowired
    private ProblemRepository problemRepository;

    public Page<Problem> getProblems(int page, int size, String search, String tag, String sortBy) {
        logger.info("Fetching problems. Page: {}, Size: {}, Search: {}, Tag: {}, Sort: {}", page, size, search, tag,
                sortBy);
        Pageable pageable = PageRequest.of(page, size);
        return problemRepository.searchProblems(search, tag, sortBy, pageable);
    }

    public Optional<Problem> getProblemById(Long id) {
        return problemRepository.findById(id);
    }
}
