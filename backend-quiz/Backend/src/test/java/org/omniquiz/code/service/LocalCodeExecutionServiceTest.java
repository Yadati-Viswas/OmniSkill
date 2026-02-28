package org.omniquiz.code.service;

import org.junit.jupiter.api.Test;
import org.omniquiz.code.config.CodeExecutionProperties;
import org.omniquiz.code.dto.CodeExecutionRequest;
import org.omniquiz.code.dto.CodeExecutionResponse;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalCodeExecutionServiceTest {

    private final LocalCodeExecutionService service;

    LocalCodeExecutionServiceTest() {
        CodeExecutionProperties properties = new CodeExecutionProperties();
        properties.setTimeout(Duration.ofSeconds(8));
        this.service = new LocalCodeExecutionService(properties);
    }

    @Test
    void executesJavaScriptLocally() {
        CodeExecutionRequest request = new CodeExecutionRequest();
        request.setLanguage("javascript");
        request.setSourceCode("console.log(2)");

        CodeExecutionResponse response = service.execute(request);

        assertNotNull(response.getStatus());
        assertEquals("Accepted", response.getStatus().getDescription());
        assertTrue(response.getStdout().contains("2"));
    }

    @Test
    void returnsCompilationErrorForInvalidJava() {
        CodeExecutionRequest request = new CodeExecutionRequest();
        request.setLanguage("java");
        request.setSourceCode("public class Main { public static void main(String[] args) { BROKEN } }");

        CodeExecutionResponse response = service.execute(request);

        assertNotNull(response.getStatus());
        assertEquals("Compilation Error", response.getStatus().getDescription());
        assertNotNull(response.getCompileOutput());
    }
}
