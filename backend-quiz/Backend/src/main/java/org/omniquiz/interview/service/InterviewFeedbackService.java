package org.omniquiz.interview.service;

import org.omniquiz.interview.dto.InterviewFeedbackMetric;
import org.omniquiz.interview.dto.InterviewFeedbackRequest;
import org.omniquiz.interview.dto.InterviewFeedbackResponse;
import org.omniquiz.interview.model.InterviewConfig;
import org.omniquiz.interview.model.TranscriptEntry;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class InterviewFeedbackService {

    private static final Set<String> STOP_WORDS = Set.of(
            "about", "after", "again", "against", "almost", "along", "also", "always", "among", "because",
            "before", "being", "between", "could", "every", "first", "from", "have", "having", "into",
            "just", "know", "like", "many", "more", "most", "other", "over", "same", "such", "than",
            "that", "their", "there", "these", "they", "this", "those", "through", "under", "very",
            "what", "when", "where", "which", "while", "with", "would", "your", "you", "ours", "ourselves",
            "role", "job", "description", "experience", "level"
    );

    private static final List<String> FILLER_TERMS = List.of(
            "um", "uh", "like", "actually", "basically", "literally", "you know", "sort of", "kind of"
    );

    private static final Set<String> STRUCTURE_TERMS = Set.of(
            "first", "second", "then", "because", "therefore", "approach", "tradeoff", "edge case",
            "complexity", "optimize", "debug", "validate", "assumption", "impact", "result"
    );

    private static final Set<String> CONFIDENCE_POSITIVE = Set.of(
            "built", "led", "shipped", "improved", "designed", "implemented", "owned", "delivered", "solved"
    );

    private static final Set<String> CONFIDENCE_NEGATIVE = Set.of(
            "maybe", "probably", "not sure", "guess", "might", "i think", "i am not sure"
    );

    private static final Set<String> TECHNICAL_TERMS = Set.of(
            "api", "backend", "frontend", "database", "architecture", "testing", "performance", "scalable",
            "microservice", "caching", "latency", "monitoring", "security", "deployment"
    );

    public InterviewFeedbackResponse generateFeedback(InterviewFeedbackRequest request) {
        InterviewConfig config = request.getConfig() != null
                ? request.getConfig()
                : new InterviewConfig("", "", "Mid", null, null);

        List<TranscriptEntry> transcript = Optional.ofNullable(request.getTranscript()).orElse(List.of());
        List<String> userTurns = transcript.stream()
                .filter(entry -> entry != null && "user".equalsIgnoreCase(entry.getSpeaker()))
                .map(TranscriptEntry::getText)
                .filter(text -> text != null && !text.isBlank())
                .toList();

        List<String> interviewerTurns = transcript.stream()
                .filter(entry -> entry != null && "ai".equalsIgnoreCase(entry.getSpeaker()))
                .map(TranscriptEntry::getText)
                .filter(text -> text != null && !text.isBlank())
                .toList();

        int questionCount = countQuestions(interviewerTurns);
        if (questionCount == 0 && !interviewerTurns.isEmpty()) {
            questionCount = Math.max(1, interviewerTurns.size() / 2);
        }

        int userTurnCount = userTurns.size();
        int totalUserWords = userTurns.stream().mapToInt(this::countWords).sum();
        double avgWordsPerAnswer = userTurnCount == 0 ? 0 : (double) totalUserWords / userTurnCount;

        int fillerWordCount = userTurns.stream().mapToInt(this::countFillerWords).sum();
        double fillerRate = totalUserWords == 0 ? 0 : (double) fillerWordCount / totalUserWords;

        String expectedContext = String.join(" ",
                Optional.ofNullable(config.getRole()).orElse(""),
                Optional.ofNullable(config.getJobDescription()).orElse(""),
                Optional.ofNullable(config.getResumeText()).orElse(""));

        boolean hasJobDescriptionContext = config.getJobDescription() != null && !config.getJobDescription().isBlank();
        boolean hasResumeContext = config.getResumeText() != null && !config.getResumeText().isBlank();

        Set<String> expectedKeywords = extractTopKeywords(expectedContext, 24);
        Set<String> userKeywords = extractKeywords(String.join(" ", userTurns));
        double keywordCoverage = expectedKeywords.isEmpty()
                ? 0.55
                : calculateCoverage(expectedKeywords, userKeywords);
        if (!hasJobDescriptionContext && !hasResumeContext) {
            // Keep technical relevance neutral when optional context fields are not provided.
            keywordCoverage = Math.max(keywordCoverage, 0.55);
        }

        double structureSignal = computeKeywordSignal(userTurns, STRUCTURE_TERMS);
        double confidenceSignal = computeConfidenceSignal(userTurns);
        double responseCoverage = questionCount <= 0
                ? (userTurnCount > 0 ? 1.0 : 0.0)
                : Math.min(1.0, (double) userTurnCount / questionCount);

        int communicationScore = calculateCommunicationScore(userTurnCount, avgWordsPerAnswer, fillerRate, responseCoverage);
        int technicalScore = calculateTechnicalScore(keywordCoverage, userTurns, config.getResumeText(), totalUserWords);
        int problemSolvingScore = calculateProblemSolvingScore(structureSignal, responseCoverage, avgWordsPerAnswer, userTurns);
        int confidenceScore = calculateConfidenceScore(confidenceSignal, fillerRate, userTurnCount);

        int overallScore = clamp((int) Math.round(
                communicationScore * 0.30
                        + technicalScore * 0.30
                        + problemSolvingScore * 0.25
                        + confidenceScore * 0.15
        ));

        List<InterviewFeedbackMetric> metrics = List.of(
                new InterviewFeedbackMetric("Communication", communicationScore,
                        communicationInsight(communicationScore, avgWordsPerAnswer, fillerRate)),
                new InterviewFeedbackMetric("Technical Relevance", technicalScore,
                        technicalInsight(technicalScore, keywordCoverage)),
                new InterviewFeedbackMetric("Problem Solving", problemSolvingScore,
                        problemSolvingInsight(problemSolvingScore, structureSignal)),
                new InterviewFeedbackMetric("Confidence", confidenceScore,
                        confidenceInsight(confidenceScore, confidenceSignal))
        );

        List<String> strengths = buildStrengths(communicationScore, technicalScore, problemSolvingScore,
                confidenceScore, responseCoverage, keywordCoverage);
        List<String> weaknesses = buildWeaknesses(communicationScore, technicalScore, problemSolvingScore,
                confidenceScore, userTurnCount, fillerRate);
        List<String> improvementTips = buildImprovementTips(weaknesses, avgWordsPerAnswer, fillerRate, keywordCoverage);
        List<String> practicePlan = buildPracticePlan(config.getRole());

        long durationMinutes = calculateDurationMinutes(request.getStartTime(), request.getEndTime(), transcript);

        String role = Optional.ofNullable(config.getRole()).filter(v -> !v.isBlank()).orElse("Target Role");
        String experienceLevel = Optional.ofNullable(config.getExperienceLevel()).filter(v -> !v.isBlank()).orElse("Mid");
        String summary = buildSummary(overallScore, role, strengths, weaknesses);

        return new InterviewFeedbackResponse(
                request.getInterviewId(),
                role,
                experienceLevel,
                overallScore,
                durationMinutes,
                userTurnCount,
                summary,
                metrics,
                strengths,
                weaknesses,
                improvementTips,
                practicePlan
        );
    }

    private int calculateCommunicationScore(int userTurnCount, double avgWordsPerAnswer, double fillerRate,
                                            double responseCoverage) {
        int score = 48;

        if (userTurnCount >= 6) score += 10;
        else if (userTurnCount >= 3) score += 5;
        else score -= 8;

        if (avgWordsPerAnswer >= 12 && avgWordsPerAnswer <= 90) score += 12;
        else if (avgWordsPerAnswer < 8) score -= 12;
        else score -= 5;

        if (fillerRate < 0.03) score += 10;
        else if (fillerRate > 0.10) score -= 10;

        score += (int) Math.round(responseCoverage * 10);
        return clamp(score);
    }

    private int calculateTechnicalScore(double keywordCoverage, List<String> userTurns,
                                        String resumeText, int totalUserWords) {
        int score = 44;
        score += (int) Math.round(keywordCoverage * 36);

        if (containsAny(userTurns, TECHNICAL_TERMS)) score += 8;
        if (resumeText != null && !resumeText.isBlank()) score += 4;
        if (totalUserWords < 40) score -= 6;

        return clamp(score);
    }

    private int calculateProblemSolvingScore(double structureSignal, double responseCoverage,
                                             double avgWordsPerAnswer, List<String> userTurns) {
        int score = 40;
        score += (int) Math.round(structureSignal * 38);
        score += (int) Math.round(responseCoverage * 14);

        if (containsAny(userTurns, Set.of("tradeoff", "complexity", "edge case", "bottleneck", "fallback", "debug"))) {
            score += 8;
        }
        if (avgWordsPerAnswer < 8) score -= 8;

        return clamp(score);
    }

    private int calculateConfidenceScore(double confidenceSignal, double fillerRate, int userTurnCount) {
        int score = 42;
        score += (int) Math.round(confidenceSignal * 35);

        if (fillerRate < 0.05) score += 8;
        else score -= 5;

        if (userTurnCount >= 4) score += 6;
        else score -= 4;

        return clamp(score);
    }

    private List<String> buildStrengths(int communication, int technical, int problemSolving, int confidence,
                                        double responseCoverage, double keywordCoverage) {
        LinkedHashSet<String> items = new LinkedHashSet<>();

        if (communication >= 70) {
            items.add("Your responses are clear and structured, which makes your communication easy to follow.");
        }
        if (technical >= 70) {
            items.add("You aligned answers well with role-relevant technical concepts.");
        }
        if (problemSolving >= 70) {
            items.add("You showed a practical problem-solving approach with reasoning steps.");
        }
        if (confidence >= 70) {
            items.add("You projected confidence and ownership while describing your work.");
        }
        if (responseCoverage >= 0.85) {
            items.add("You maintained strong question coverage and answered most prompts directly.");
        }
        if (keywordCoverage >= 0.70) {
            items.add("Your answers mapped well to the job requirements and profile context.");
        }
        if (items.isEmpty()) {
            items.add("You stayed engaged and completed the interview flow, which is a strong baseline.");
        }
        return new ArrayList<>(items);
    }

    private List<String> buildWeaknesses(int communication, int technical, int problemSolving, int confidence,
                                         int userTurnCount, double fillerRate) {
        LinkedHashSet<String> items = new LinkedHashSet<>();

        if (communication < 65) {
            items.add("Some answers were either too brief or not consistently structured.");
        }
        if (technical < 65) {
            items.add("Technical depth did not consistently match the role expectations.");
        }
        if (problemSolving < 65) {
            items.add("Reasoning steps and tradeoff analysis can be made more explicit.");
        }
        if (confidence < 65) {
            items.add("Answer delivery included uncertainty phrases that reduced confidence impact.");
        }
        if (userTurnCount < 3) {
            items.add("Limited answer volume reduced the quality of interview assessment.");
        }
        if (fillerRate > 0.10) {
            items.add("Frequent filler words reduced clarity and executive presence.");
        }
        if (items.isEmpty()) {
            items.add("No major weaknesses were detected, but consistency can still be improved.");
        }
        return new ArrayList<>(items);
    }

    private List<String> buildImprovementTips(List<String> weaknesses, double avgWordsPerAnswer,
                                              double fillerRate, double keywordCoverage) {
        LinkedHashSet<String> tips = new LinkedHashSet<>();

        for (String weakness : weaknesses) {
            String lower = weakness.toLowerCase(Locale.ROOT);
            if (lower.contains("brief") || lower.contains("structured")) {
                tips.add("Use a 3-part answer pattern: context, action, measurable outcome.");
            }
            if (lower.contains("technical")) {
                tips.add("Add concrete project details: architecture choices, tools, scale, and impact.");
            }
            if (lower.contains("tradeoff") || lower.contains("reasoning")) {
                tips.add("State alternatives and explain why you selected one approach.");
            }
            if (lower.contains("uncertainty") || lower.contains("confidence")) {
                tips.add("Replace hedging phrases with specific evidence from your experience.");
            }
            if (lower.contains("filler")) {
                tips.add("Pause briefly before answering instead of using filler words.");
            }
        }

        if (avgWordsPerAnswer < 10) {
            tips.add("Target 45-90 second answers so each response includes enough depth.");
        }
        if (fillerRate < 0.03) {
            tips.add("Keep your current speaking clarity and focus on richer technical examples.");
        }
        if (keywordCoverage < 0.5) {
            tips.add("Mirror the job description keywords when discussing your projects and achievements.");
        }
        if (tips.isEmpty()) {
            tips.add("Maintain this level and practice mock rounds focused on tougher scenario questions.");
        }

        return new ArrayList<>(tips).stream().limit(6).toList();
    }

    private List<String> buildPracticePlan(String role) {
        String normalizedRole = role == null || role.isBlank() ? "the target role" : role;
        return List.of(
                "Day 1-2: Prepare 5 STAR stories mapped to " + normalizedRole + " responsibilities.",
                "Day 3: Practice 30 minutes of role-specific technical Q&A with timing constraints.",
                "Day 4: Record answers and review for fillers, pacing, and structure.",
                "Day 5: Run one full mock interview and compare scores against this report."
        );
    }

    private String communicationInsight(int score, double avgWordsPerAnswer, double fillerRate) {
        if (score >= 80) return "Strong pacing and clarity with effective response length.";
        if (score >= 65) return "Communication is good but can improve with clearer structuring.";
        return "Focus on concise structure and reducing filler terms for better clarity.";
    }

    private String technicalInsight(int score, double keywordCoverage) {
        if (score >= 80) return "Excellent role alignment with solid technical relevance.";
        if (score >= 65) return "Reasonable technical coverage, but add deeper implementation detail.";
        return "Increase role-specific technical depth and align examples with job expectations.";
    }

    private String problemSolvingInsight(int score, double structureSignal) {
        if (score >= 80) return "Strong analytical framing and clear decision making.";
        if (score >= 65) return "Good baseline reasoning; make tradeoffs and edge cases explicit.";
        return "Show your thinking steps explicitly: assumptions, options, and tradeoffs.";
    }

    private String confidenceInsight(int score, double confidenceSignal) {
        if (score >= 80) return "Confident and ownership-driven delivery.";
        if (score >= 65) return "Moderate confidence; stronger evidence-based language will help.";
        return "Use assertive language supported by clear outcomes and project ownership.";
    }

    private String buildSummary(int overallScore, String role, List<String> strengths, List<String> weaknesses) {
        if (overallScore >= 85) {
            return "Excellent interview performance for " + role + ". You demonstrated strong clarity, depth, and confidence.";
        }
        if (overallScore >= 70) {
            return "Solid performance for " + role + " with clear potential. Fine-tuning technical depth and structure will lift you further.";
        }
        if (overallScore >= 55) {
            return "Promising baseline for " + role + ". Focused practice on structure, depth, and confidence will significantly improve outcomes.";
        }
        return "Early-stage performance for " + role + ". Build stronger answer structure and role-specific examples before the next mock round.";
    }

    private long calculateDurationMinutes(Long startTime, Long endTime, List<TranscriptEntry> transcript) {
        if (startTime != null && endTime != null && endTime > startTime) {
            long durationMs = endTime - startTime;
            return Math.max(1L, Math.round(durationMs / 60000.0));
        }

        List<Long> timestamps = transcript.stream()
                .map(TranscriptEntry::getTimestamp)
                .filter(ts -> ts != null && ts > 0)
                .sorted()
                .toList();

        if (timestamps.size() >= 2) {
            long durationMs = timestamps.get(timestamps.size() - 1) - timestamps.get(0);
            return Math.max(1L, Math.round(durationMs / 60000.0));
        }
        return 0;
    }

    private int countQuestions(List<String> interviewerTurns) {
        int count = 0;
        for (String text : interviewerTurns) {
            if (text == null || text.isBlank()) continue;
            int questionMarks = (int) text.chars().filter(ch -> ch == '?').count();
            if (questionMarks > 0) {
                count += questionMarks;
                continue;
            }
            String lower = text.toLowerCase(Locale.ROOT);
            if (lower.startsWith("tell me") || lower.startsWith("describe")
                    || lower.startsWith("how would") || lower.startsWith("what")) {
                count += 1;
            }
        }
        return count;
    }

    private int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) Arrays.stream(text.trim().split("\\s+"))
                .filter(token -> !token.isBlank())
                .count();
    }

    private int countFillerWords(String text) {
        if (text == null || text.isBlank()) return 0;
        String normalized = " " + text.toLowerCase(Locale.ROOT) + " ";
        int count = 0;
        for (String filler : FILLER_TERMS) {
            count += countExactPhrase(normalized, filler.toLowerCase(Locale.ROOT));
        }
        return count;
    }

    private int countExactPhrase(String text, String phrase) {
        Pattern pattern = Pattern.compile("\\b" + Pattern.quote(phrase) + "\\b");
        return (int) pattern.matcher(text).results().count();
    }

    private Set<String> extractTopKeywords(String text, int limit) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        Map<String, Long> freq = Arrays.stream(normalizeToTokens(text))
                .filter(this::isUsefulKeyword)
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        return freq.entrySet().stream()
                .sorted(Comparator
                        .comparing(Map.Entry<String, Long>::getValue, Comparator.reverseOrder())
                        .thenComparing(Map.Entry::getKey))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Set<String> extractKeywords(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(normalizeToTokens(text))
                .filter(this::isUsefulKeyword)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String[] normalizeToTokens(String text) {
        return text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .split("\\s+");
    }

    private boolean isUsefulKeyword(String token) {
        return token != null
                && token.length() >= 4
                && !STOP_WORDS.contains(token)
                && !token.chars().allMatch(Character::isDigit);
    }

    private double calculateCoverage(Set<String> expectedKeywords, Set<String> userKeywords) {
        if (expectedKeywords.isEmpty()) return 0.0;
        long matched = expectedKeywords.stream().filter(userKeywords::contains).count();
        return (double) matched / expectedKeywords.size();
    }

    private double computeKeywordSignal(List<String> turns, Set<String> keywords) {
        if (turns.isEmpty() || keywords.isEmpty()) return 0.0;
        String combined = String.join(" ", turns).toLowerCase(Locale.ROOT);
        long matches = keywords.stream().filter(combined::contains).count();
        return Math.min(1.0, matches / (double) Math.max(4, keywords.size() / 2));
    }

    private double computeConfidenceSignal(List<String> turns) {
        if (turns.isEmpty()) return 0.0;
        String combined = String.join(" ", turns).toLowerCase(Locale.ROOT);
        long positive = CONFIDENCE_POSITIVE.stream().filter(combined::contains).count();
        long negative = CONFIDENCE_NEGATIVE.stream().filter(combined::contains).count();

        double signal = 0.5 + ((positive - negative) / 10.0);
        return clampDouble(signal, 0.0, 1.0);
    }

    private boolean containsAny(List<String> turns, Set<String> terms) {
        String combined = String.join(" ", turns).toLowerCase(Locale.ROOT);
        return terms.stream().anyMatch(combined::contains);
    }

    private int clamp(int score) {
        return Math.max(0, Math.min(100, score));
    }

    private double clampDouble(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
