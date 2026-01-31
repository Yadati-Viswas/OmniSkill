package org.omniquiz.interview.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
public class Interview {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Id
    private String id;

    @Embedded
    private InterviewConfig config;

    @Column(columnDefinition = "TEXT")
    private String transcriptJson;

    @Column(nullable = false)
    private Long startTime;

    @Column
    private Long endTime;

    @Column
    private Long userId;

    // Transient field for transcript list (not persisted directly)
    @Transient
    private List<TranscriptEntry> transcript;

    @PrePersist
    @PreUpdate
    public void serializeTranscript() {
        if (transcript != null) {
            try {
                this.transcriptJson = objectMapper.writeValueAsString(transcript);
            } catch (JsonProcessingException e) {
                this.transcriptJson = "[]";
            }
        }
    }

    @PostLoad
    public void deserializeTranscript() {
        if (transcriptJson != null && !transcriptJson.isEmpty()) {
            try {
                this.transcript = objectMapper.readValue(transcriptJson, new TypeReference<List<TranscriptEntry>>() {
                });
            } catch (JsonProcessingException e) {
                this.transcript = new ArrayList<>();
            }
        } else {
            this.transcript = new ArrayList<>();
        }
    }

    public List<TranscriptEntry> getTranscript() {
        if (transcript == null && transcriptJson != null) {
            deserializeTranscript();
        }
        return transcript != null ? transcript : new ArrayList<>();
    }

    public void setTranscript(List<TranscriptEntry> transcript) {
        this.transcript = transcript;
        serializeTranscript();
    }
}
