package org.omniquiz.code.service;

import org.omniquiz.code.config.CodeExecutionProperties;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class LocalCodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(LocalCodeExecutionService.class);

    private static final int STATUS_ACCEPTED = 3;
    private static final int STATUS_TIME_LIMIT = 5;
    private static final int STATUS_COMPILATION_ERROR = 6;
    private static final int STATUS_RUNTIME_ERROR = 12;
    private static final int STATUS_INTERNAL_ERROR = 13;

    private final CodeExecutionProperties properties;

    public LocalCodeExecutionService(CodeExecutionProperties properties) {
        this.properties = properties;
    }

    public CodeExecutionResponse execute(CodeExecutionRequest request) {
        if (request == null || request.getSourceCode() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Source code is required");
        }

        String language = request.getLanguage() == null ? "" : request.getLanguage().trim().toLowerCase(Locale.ROOT);
        return switch (language) {
            case "javascript" -> executeInterpreted("main.js", request.getSourceCode(),
                    List.of("node", "main.js"), request.getStdin());
            case "python" -> executeInterpreted("main.py", request.getSourceCode(),
                    List.of("python3", "main.py"), request.getStdin());
            case "java" -> executeCompiled("Main.java", request.getSourceCode(),
                    List.of("javac", "Main.java"), List.of("java", "Main"), request.getStdin());
            case "cpp", "c++" -> executeCompiled("main.cpp", request.getSourceCode(),
                    List.of("g++", "main.cpp", "-std=c++17", "-O2", "-o", "main"), List.of("./main"), request.getStdin());
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported language");
        };
    }

    private CodeExecutionResponse executeInterpreted(String fileName,
                                                     String sourceCode,
                                                     List<String> runCommand,
                                                     String stdin) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("omniskill-local-exec-");
            Files.writeString(tempDir.resolve(fileName), sourceCode, StandardCharsets.UTF_8);
            ProcessResult run = runProcess(runCommand, tempDir, stdin);
            return toRunResponse(run);
        } catch (IOException e) {
            logger.error("Local interpreted execution failed", e);
            return internalError("Local execution failed: " + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private CodeExecutionResponse executeCompiled(String fileName,
                                                  String sourceCode,
                                                  List<String> compileCommand,
                                                  List<String> runCommand,
                                                  String stdin) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("omniskill-local-exec-");
            Files.writeString(tempDir.resolve(fileName), sourceCode, StandardCharsets.UTF_8);

            ProcessResult compile = runProcess(compileCommand, tempDir, "");
            if (compile.timedOut()) {
                return timeoutResponse(compile, "Local compilation timed out");
            }
            if (compile.exitCode() != 0) {
                CodeExecutionResponse response = new CodeExecutionResponse();
                response.setCompileOutput(nonEmpty(compile.stderr(), compile.stdout()));
                response.setStatus(status(STATUS_COMPILATION_ERROR, "Compilation Error"));
                response.setTime(formatMillis(compile.elapsedMillis()));
                return response;
            }

            ProcessResult run = runProcess(runCommand, tempDir, stdin);
            return toRunResponse(run);
        } catch (IOException e) {
            logger.error("Local compiled execution failed", e);
            return internalError("Local execution failed: " + e.getMessage());
        } finally {
            cleanup(tempDir);
        }
    }

    private CodeExecutionResponse toRunResponse(ProcessResult run) {
        if (run.timedOut()) {
            return timeoutResponse(run, "Local execution timed out");
        }

        CodeExecutionResponse response = new CodeExecutionResponse();
        response.setStdout(emptyToNull(run.stdout()));
        response.setStderr(emptyToNull(run.stderr()));
        response.setTime(formatMillis(run.elapsedMillis()));

        if (run.exitCode() == 0) {
            response.setStatus(status(STATUS_ACCEPTED, "Accepted"));
            return response;
        }

        response.setStatus(status(STATUS_RUNTIME_ERROR, "Runtime Error (Other)"));
        response.setMessage("Process exited with code " + run.exitCode());
        return response;
    }

    private CodeExecutionResponse timeoutResponse(ProcessResult result, String message) {
        CodeExecutionResponse response = new CodeExecutionResponse();
        response.setStdout(emptyToNull(result.stdout()));
        response.setStderr(emptyToNull(result.stderr()));
        response.setTime(formatMillis(result.elapsedMillis()));
        response.setStatus(status(STATUS_TIME_LIMIT, "Time Limit Exceeded"));
        response.setMessage(message);
        return response;
    }

    private CodeExecutionResponse internalError(String message) {
        CodeExecutionResponse response = new CodeExecutionResponse();
        response.setStatus(status(STATUS_INTERNAL_ERROR, "Internal Error"));
        response.setMessage(message);
        return response;
    }

    private ProcessResult runProcess(List<String> command, Path workingDir, String stdin) throws IOException {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(workingDir.toFile());

        long startedAt = System.nanoTime();
        Process process = processBuilder.start();

        CompletableFuture<String> stdoutFuture = readStream(process.getInputStream());
        CompletableFuture<String> stderrFuture = readStream(process.getErrorStream());

        try (OutputStream outputStream = process.getOutputStream()) {
            if (stdin != null && !stdin.isEmpty()) {
                outputStream.write(stdin.getBytes(StandardCharsets.UTF_8));
            }
        }

        Duration timeout = properties.getTimeout() == null ? Duration.ofSeconds(20) : properties.getTimeout();
        long timeoutMs = Math.max(1000L, timeout.toMillis());

        boolean finished;
        try {
            finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Execution interrupted", e);
        }

        if (!finished) {
            process.destroyForcibly();
        }

        String stdout = stdoutFuture.join();
        String stderr = stderrFuture.join();
        long elapsedMillis = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);
        int exitCode = finished ? process.exitValue() : -1;

        return new ProcessResult(exitCode, stdout, stderr, !finished, elapsedMillis);
    }

    private CompletableFuture<String> readStream(InputStream inputStream) {
        return CompletableFuture.supplyAsync(() -> {
            try (InputStream stream = inputStream) {
                return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                logger.warn("Failed to read process stream", e);
                return "";
            }
        });
    }

    private void cleanup(Path tempDir) {
        if (tempDir == null) {
            return;
        }
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            logger.warn("Failed to delete temp path {}", path, e);
                        }
                    });
        } catch (IOException e) {
            logger.warn("Failed to cleanup temp directory {}", tempDir, e);
        }
    }

    private CodeExecutionResponse.Status status(int id, String description) {
        CodeExecutionResponse.Status status = new CodeExecutionResponse.Status();
        status.setId(id);
        status.setDescription(description);
        return status;
    }

    private String formatMillis(long millis) {
        return String.format(Locale.US, "%.3f", millis / 1000.0);
    }

    private String nonEmpty(String preferred, String alternative) {
        String first = emptyToNull(preferred);
        if (first != null) {
            return first;
        }
        return emptyToNull(alternative);
    }

    private String emptyToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private record ProcessResult(int exitCode, String stdout, String stderr, boolean timedOut, long elapsedMillis) {
    }
}
