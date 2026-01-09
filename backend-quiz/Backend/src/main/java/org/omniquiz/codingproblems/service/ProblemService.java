package org.omniquiz.codingproblems.service;


import java.util.Optional;

import org.omniquiz.codingproblems.model.Problem;
import org.omniquiz.codingproblems.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProblemService {

    @Autowired
    private ProblemRepository problemRepository;

    public Page<Problem> getProblems(int page, int size, String search, String tag, String sortBy) {
        Pageable pageable = PageRequest.of(page, size);
        return problemRepository.searchProblems(search, tag, sortBy, pageable);
    }

    public Optional<Problem> getProblemById(Long id) {
        return problemRepository.findById(id);
    }
}
