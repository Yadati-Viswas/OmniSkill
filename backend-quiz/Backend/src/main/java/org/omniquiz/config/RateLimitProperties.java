package org.omniquiz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "security.rate-limit")
public class RateLimitProperties {

    private int authRequests = 5;
    private Duration authDuration = Duration.ofMinutes(1);
    private int apiRequests = 60;
    private Duration apiDuration = Duration.ofMinutes(1);

    public int getAuthRequests() {
        return authRequests;
    }

    public void setAuthRequests(int authRequests) {
        this.authRequests = authRequests;
    }

    public Duration getAuthDuration() {
        return authDuration;
    }

    public void setAuthDuration(Duration authDuration) {
        this.authDuration = authDuration;
    }

    public int getApiRequests() {
        return apiRequests;
    }

    public void setApiRequests(int apiRequests) {
        this.apiRequests = apiRequests;
    }

    public Duration getApiDuration() {
        return apiDuration;
    }

    public void setApiDuration(Duration apiDuration) {
        this.apiDuration = apiDuration;
    }
}
