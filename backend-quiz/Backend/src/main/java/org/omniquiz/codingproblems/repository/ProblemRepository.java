package org.omniquiz.codingproblems.repository;

import org.omniquiz.codingproblems.model.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    @Query("SELECT p FROM Problem p WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.tags) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:tag IS NULL OR :tag = '' OR LOWER(p.tags) LIKE LOWER(CONCAT('%', :tag, '%'))) AND " +
            "(:sortBy IS NOT NULL OR :sortBy IS NULL) " +
            "ORDER BY " +
            "CASE WHEN :sortBy = 'difficulty_asc' THEN (CASE p.difficultyLevel WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END) END ASC, " +
            "CASE WHEN :sortBy = 'difficulty_desc' THEN (CASE p.difficultyLevel WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END) END DESC, " +
            "p.id ASC")
    Page<Problem> searchProblems(@Param("search") String search, @Param("tag") String tag, @Param("sortBy") String sortBy, Pageable pageable);
}
