package org.omniquiz.interview.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptEntry {
    private String speaker; // "user" or "ai"
    private String text;
    private Long timestamp;
}
