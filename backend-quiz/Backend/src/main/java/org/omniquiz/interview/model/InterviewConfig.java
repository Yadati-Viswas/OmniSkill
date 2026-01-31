package org.omniquiz.interview.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewConfig {
    private String role;
    private String jobDescription;
    private String experienceLevel;
}
