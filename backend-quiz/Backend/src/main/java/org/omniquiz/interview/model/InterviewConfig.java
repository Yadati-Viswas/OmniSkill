package org.omniquiz.interview.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewConfig {
    private String role;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String jobDescription;
    private String experienceLevel;
    private String resumeFileName;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String resumeText;
}
