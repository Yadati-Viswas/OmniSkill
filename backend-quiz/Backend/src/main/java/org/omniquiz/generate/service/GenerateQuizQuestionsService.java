package org.omniquiz.generate.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.omniquiz.quiz.dto.QuizDTO;
import org.omniquiz.quiz.model.Quiz;
import org.omniquiz.quiz.model.QuizQuestion;
import org.omniquiz.quiz.repository.QuizRepository;
import org.omniquiz.quiz.dto.GeneratedQuizQuestionsDTO;  // Legacy for Gemini response
import org.omniquiz.user.model.User;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GenerateQuizQuestionsService {

    @Autowired
    private QuizRepository quizRepository;  // Unified repo

    private final ChatModel chatModel;
    private final ObjectMapper mapper;

    @Autowired
    public GenerateQuizQuestionsService(ChatModel chatModel) {
        this.chatModel = chatModel;
        this.mapper = new ObjectMapper();
    }

    public List<QuizDTO.QuestionDTO> generateAllQuestions(String prompt, int totalQuestions) {
        int batchSize = 5;
        int totalBatches = (totalQuestions + batchSize - 1) / batchSize;  // Ceiling division

        List<CompletableFuture<List<GeneratedQuizQuestionsDTO>>> futures = new ArrayList<>();
        for (int i = 0; i < totalBatches; i++) {
            int currentBatchSize = Math.min(batchSize, totalQuestions - i * batchSize);
            String batchPrompt = prompt.replaceFirst("\\d+", String.valueOf(currentBatchSize));
            System.out.println("Batch Prompt: " + batchPrompt);
            futures.add(CompletableFuture.supplyAsync(() -> generateContent(batchPrompt)));
        }

        // Fixed: Join all futures before checking remaining (no post-join addition)
        List<GeneratedQuizQuestionsDTO> allGenerated = futures.stream()
                .map(CompletableFuture::join)
                .flatMap(List::stream)
                .collect(Collectors.toList());

        if (allGenerated.size() < totalQuestions) {
            int missing = totalQuestions - allGenerated.size();
            System.out.println("Generated " + allGenerated.size() + ", missing " + missing + " — retrying...");
        }

        return allGenerated.stream().map(this::toQuestionDTO).collect(Collectors.toList());
    }

    private QuizDTO.QuestionDTO toQuestionDTO(GeneratedQuizQuestionsDTO genQ) {
        QuizDTO.QuestionDTO q = new QuizDTO.QuestionDTO();
        q.setQuestion(genQ.getQuestion());
        q.setCode(genQ.getCode());
        q.setExplanation(genQ.getExplanation());
        q.setOptions(genQ.getOptions());
        q.setCorrectIndex(mapAnswerToIndex(genQ.getAnswer(), genQ.getOptions()));  // Map "b" → 1
        return q;
    }

    private Integer mapAnswerToIndex(String answer, List<String> options) {
        if (answer == null || options == null) return null;
        // Assume answer like "b" or "Option 2"
        String lowerAnswer = answer.toLowerCase().trim();
        if (lowerAnswer.matches("[a-d]")) {
            return lowerAnswer.charAt(0) - 'a';  // a→0, b→1, etc.
        }
        // Fallback: find matching text
        return options.indexOf(answer);
    }

    public List<GeneratedQuizQuestionsDTO> generateContent(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String rawResponse = chatModel.call(prompt);
            System.out.println("Raw Response: " + rawResponse);
            return mapper.readValue(rawResponse, mapper.getTypeFactory().constructCollectionType(List.class, GeneratedQuizQuestionsDTO.class));
        } catch (Exception e) {
            System.out.println("Error during generation: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Transactional
    public QuizDTO saveQuiz(QuizDTO dto, User user) {
        Quiz quiz = new Quiz();
        quiz.setTitle(dto.getTitle());
        quiz.setReferral(dto.getReferral());
        quiz.setTopic(dto.getTitle());
        quiz.setUser(user);
        quiz.setType(Quiz.QuizType.GENERATED);

        for (QuizDTO.QuestionDTO qDto : dto.getQuestions()) {
            QuizQuestion q = new QuizQuestion();
            q.setQuestion(qDto.getQuestion());
            q.setCode(qDto.getCode());
            q.setExplanation(qDto.getExplanation());
            q.setOptions(qDto.getOptions());
            q.setCorrectIndex(qDto.getCorrectIndex());
            q.setUser(user);
            quiz.addQuestion(q);
        }

        quiz = quizRepository.save(quiz);
        return toQuizDTO(quiz);
    }

    public QuizDTO toQuizDTO(Quiz quiz) {
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setType(quiz.getType().name());
        dto.setReferral(quiz.getReferral());
        dto.setCreatorName(quiz.getUser().getFirstName() + " " + quiz.getUser().getLastName());
        List<QuizDTO.QuestionDTO> questionDtos = quiz.getQuestions().stream()
                .map(this::toQuestionDTO)
                .collect(Collectors.toList());
        dto.setQuestions(questionDtos);

        return dto;
    }

    private QuizDTO.QuestionDTO toQuestionDTO(QuizQuestion q) {
        QuizDTO.QuestionDTO dto = new QuizDTO.QuestionDTO();
        dto.setQuestion(q.getQuestion());
        dto.setCode(q.getCode());
        dto.setExplanation(q.getExplanation());
        dto.setOptions(q.getOptions());
        dto.setCorrectIndex(q.getCorrectIndex());
        return dto;
    }
}