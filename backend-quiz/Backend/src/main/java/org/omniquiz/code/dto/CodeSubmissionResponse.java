package org.omniquiz.code.dto;

import java.util.ArrayList;
import java.util.List;

public class CodeSubmissionResponse {
    private boolean allPassed;
    private int passedCount;
    private int totalCount;
    private List<TestCaseResult> results = new ArrayList<>();

    public boolean isAllPassed() {
        return allPassed;
    }

    public void setAllPassed(boolean allPassed) {
        this.allPassed = allPassed;
    }

    public int getPassedCount() {
        return passedCount;
    }

    public void setPassedCount(int passedCount) {
        this.passedCount = passedCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public List<TestCaseResult> getResults() {
        return results;
    }

    public void setResults(List<TestCaseResult> results) {
        this.results = results;
    }

    public static class TestCaseResult {
        private int index;
        private boolean passed;
        private String expected;
        private String actual;
        private String error;

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }

        public boolean isPassed() {
            return passed;
        }

        public void setPassed(boolean passed) {
            this.passed = passed;
        }

        public String getExpected() {
            return expected;
        }

        public void setExpected(String expected) {
            this.expected = expected;
        }

        public String getActual() {
            return actual;
        }

        public void setActual(String actual) {
            this.actual = actual;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }
    }
}
