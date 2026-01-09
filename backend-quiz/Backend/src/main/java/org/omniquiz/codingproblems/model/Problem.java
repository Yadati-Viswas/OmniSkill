package org.omniquiz.codingproblems.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.List;

@Entity
@Table(name = "problems")
@Data
public class Problem {
    @Id
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String difficultyLevel;

    @Column
    private ZonedDateTime createdAt;

    @Column
    private ZonedDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String examples;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String testCases;

    @Column(name = "tags")
    private String tags;
}
