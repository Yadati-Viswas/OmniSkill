package org.omniquiz.codingproblems.controller;

import org.omniquiz.codingproblems.model.Problem;
import org.omniquiz.codingproblems.service.ProblemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1-api/problems")
public class ProblemController {

    @Autowired
    private ProblemService problemService;

    @GetMapping
    public ResponseEntity<Page<Problem>> getAllProblems( @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size,
            @RequestParam(required = false, defaultValue = "") String search, @RequestParam(required = false, defaultValue = "") String tag,
            @RequestParam(required = false, defaultValue = "") String sort) {
        Page<Problem> problems = problemService.getProblems(page, size, search, tag, sort);
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Problem> getProblemById(@PathVariable Long id) {
        return problemService.getProblemById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
