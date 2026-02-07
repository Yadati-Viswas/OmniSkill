package org.omniquiz.code.service;

import org.omniquiz.code.config.CodeExecutionProperties;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class CodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionService.class);

    private final CodeExecutionProperties properties;
    private final WebClient webClient;

    public CodeExecutionService(CodeExecutionProperties properties) {
        this.properties = properties;
        this.webClient = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Content-Type", "application/json")
                .build();
        logger.info("Judge0 baseUrl configured: {}", properties.getBaseUrl());
    }

    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        if (!properties.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Code execution is disabled");
        }

        Integer languageId = mapLanguage(request.getLanguage());
        if (languageId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported language");
        }

        logger.info("Executing code. Language: {}, SourceLength: {}, StdinLength: {}",
                request.getLanguage(),
                request.getSourceCode() != null ? request.getSourceCode().length() : 0,
                request.getStdin() != null ? request.getStdin().length() : 0);

        Map<String, Object> payload = new HashMap<>();
        payload.put("language_id", languageId);
        payload.put("source_code", request.getSourceCode());
        payload.put("stdin", request.getStdin() == null ? "" : request.getStdin());

        WebClient.RequestBodySpec spec = webClient.post()
                .uri("/submissions?base64_encoded=false&wait=true");

        if (properties.getApiKey() != null && !properties.getApiKey().isBlank()) {
            spec = spec.header("X-RapidAPI-Key", properties.getApiKey());
        }
        if (properties.getApiHost() != null && !properties.getApiHost().isBlank()) {
            spec = spec.header("X-RapidAPI-Host", properties.getApiHost());
        }

        try {
            CodeExecutionResponse response = spec
                    .bodyValue(payload)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, clientResponse ->
                            clientResponse.bodyToMono(String.class)
                                    .defaultIfEmpty("")
                                    .flatMap(body -> {
                                        logger.error("Judge0 error. Status: {}, Body: {}", clientResponse.statusCode(), body);
                                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 error"));
                                    }))
                    .bodyToMono(CodeExecutionResponse.class)
                    .block(properties.getTimeout());

            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "No response from Judge0");
            }
            return response;
        } catch (WebClientResponseException e) {
            logger.error("Judge0 response error. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 response error");
        } catch (Exception e) {
            logger.error("Judge0 request failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 request failed");
        }
    }

    private Integer mapLanguage(String language) {
        if (language == null) return null;
        return switch (language.toLowerCase()) {
            case "javascript" -> 63;
            case "python" -> 71;
            case "java" -> 62;
            case "cpp", "c++" -> 54;
            default -> null;
        };
    }
}
