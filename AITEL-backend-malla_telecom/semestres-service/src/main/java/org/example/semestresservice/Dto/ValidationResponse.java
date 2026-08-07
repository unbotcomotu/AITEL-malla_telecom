package org.example.semestresservice.Dto;

import java.util.List;

public class ValidationResponse {
    private boolean valid;
    private List<String> errors;

    public ValidationResponse(boolean valid, List<String> errors) {
        this.valid = valid;
        this.errors = errors;
    }

    public boolean isValid() {
        return valid;
    }

    public List<String> getErrors() {
        return errors;
    }
}
