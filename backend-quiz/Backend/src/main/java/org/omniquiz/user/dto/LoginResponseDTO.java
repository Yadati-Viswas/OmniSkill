package org.omniquiz.user.dto;

import org.omniquiz.user.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponseDTO {
    @JsonProperty("success")
    private boolean success;
    @JsonProperty("token")
    private String token;
    @JsonProperty("expiresIn")
    private long expiresIn;
    @JsonProperty("user")
    private User user;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(boolean success, String token, long expiresIn, User user) {
        this.success = success;
        this.token = token;
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}