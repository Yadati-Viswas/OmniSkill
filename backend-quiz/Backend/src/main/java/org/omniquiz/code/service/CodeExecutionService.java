package org.omniquiz.code.service;

import org.omniquiz.code.config.CodeExecutionProperties;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
public class CodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionService.class);

    private final CodeExecutionProperties properties;
    private final LocalCodeExecutionService localExecutionService;
    private final WebClient webClient;

    public CodeExecutionService(CodeExecutionProperties properties,
                                LocalCodeExecutionService localExecutionService) {
        this.properties = properties;
        this.localExecutionService = localExecutionService;
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

        if (properties.isPreferLocal()) {
            logger.info("Executing code locally because code.execution.prefer-local=true");
            return localExecutionService.execute(request);
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

            if (properties.isLocalFallbackEnabled() && shouldFallbackToLocal(response)) {
                logger.warn("Judge0 returned infrastructure-level failure. Falling back to local execution. status={}, message={}",
                        response.getStatus() != null ? response.getStatus().getDescription() : null,
                        response.getMessage());
                return localExecutionService.execute(request);
            }

            return response;
        } catch (WebClientResponseException e) {
            logger.error("Judge0 response error. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            if (properties.isLocalFallbackEnabled()) {
                logger.warn("Falling back to local execution after Judge0 response error");
                return localExecutionService.execute(request);
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Judge0 response error");
        } catch (WebClientRequestException e) {
            logger.error("Judge0 request failed", e);
            if (properties.isLocalFallbackEnabled()) {
                logger.warn("Falling back to local execution because Judge0 is unreachable");
                return localExecutionService.execute(request);
            }
            String hint = "Code execution engine is unreachable at " + properties.getBaseUrl()
                    + ". Start Judge0 by running `docker compose up -d` inside the `judge0-v1.13.1` directory.";
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, hint);
        } catch (Exception e) {
            logger.error("Judge0 request failed", e);
            if (properties.isLocalFallbackEnabled()) {
                logger.warn("Falling back to local execution after Judge0 failure");
                return localExecutionService.execute(request);
            }
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

    private boolean shouldFallbackToLocal(CodeExecutionResponse response) {
        String status = response.getStatus() != null ? safeLower(response.getStatus().getDescription()) : "";
        String message = safeLower(response.getMessage());
        String stderr = safeLower(response.getStderr());
        String compile = safeLower(response.getCompileOutput());

        if (status.contains("internal error")) {
            return true;
        }
        if (message.contains("/box/script") || message.contains("fatal signal 5")) {
            return true;
        }
        if (stderr.contains("rosetta error") || compile.contains("code cache")) {
            return true;
        }

        if (status.contains("time limit exceeded") && message.contains("wall clock")) {
            double time = parseSeconds(response.getTime());
            if (time >= 0 && time < 1.0 && (response.getStdout() == null || response.getStdout().isBlank())) {
                return true;
            }
        }

        return false;
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    private double parseSeconds(String value) {
        if (value == null || value.isBlank()) {
            return -1;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
