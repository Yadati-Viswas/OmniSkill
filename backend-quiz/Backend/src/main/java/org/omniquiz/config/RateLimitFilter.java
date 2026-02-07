package org.omniquiz.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitProperties properties;
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> apiBuckets = new ConcurrentHashMap<>();

    public RateLimitFilter(RateLimitProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getServletPath();
        boolean isAuth = path.startsWith("/v1-api/auth/");
        boolean isApi = path.startsWith("/v1-api/");

        if (!isApi) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveClientKey(request, isAuth ? "auth" : "api");
        Bucket bucket = isAuth ? resolveAuthBucket(key) : resolveApiBucket(key);

        if (bucket.tryConsume(1)) {
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"rate_limit_exceeded\",\"message\":\"Too many requests. Please try again later.\"}");
    }

    private Bucket resolveAuthBucket(String key) {
        return authBuckets.computeIfAbsent(key, k -> newBucket(properties.getAuthRequests(), properties.getAuthDuration()));
    }

    private Bucket resolveApiBucket(String key) {
        return apiBuckets.computeIfAbsent(key, k -> newBucket(properties.getApiRequests(), properties.getApiDuration()));
    }

    private Bucket newBucket(int requests, Duration duration) {
        Bandwidth limit = Bandwidth.classic(requests, Refill.intervally(requests, duration));
        return Bucket.builder().addLimit(limit).build();
    }

    private String resolveClientKey(HttpServletRequest request, String scope) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String clientIp = forwardedFor.split(",")[0].trim();
            return scope + ":" + clientIp;
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return scope + ":" + realIp.trim();
        }
        return scope + ":" + request.getRemoteAddr();
    }
}
