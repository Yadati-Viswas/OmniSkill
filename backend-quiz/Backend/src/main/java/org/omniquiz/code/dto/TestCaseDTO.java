package org.omniquiz.code.dto;

import java.util.Map;

public class TestCaseDTO {
    private Map<String, Object> input;
    private Object expected_output;

    public Map<String, Object> getInput() {
        return input;
    }

    public void setInput(Map<String, Object> input) {
        this.input = input;
    }

    public Object getExpected_output() {
        return expected_output;
    }

    public void setExpected_output(Object expected_output) {
        this.expected_output = expected_output;
    }
}
