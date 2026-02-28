package org.omniquiz.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeParseResponse {
    private String fileName;
    private String text;
    private int extractedCharacters;
    private boolean truncated;
}
