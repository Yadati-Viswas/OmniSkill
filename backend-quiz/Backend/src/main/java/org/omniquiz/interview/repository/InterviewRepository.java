package org.omniquiz.interview.repository;

import org.omniquiz.interview.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, String> {
    List<Interview> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Interview> findAllByOrderByStartTimeDesc();
}
