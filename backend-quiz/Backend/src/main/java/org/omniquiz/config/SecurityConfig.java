package org.omniquiz.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    private final AuthenticationProvider authenticationProvider;
    private final RateLimitFilter rateLimitFilter;
    private final RequestIdFilter requestIdFilter;

    // Dependencies needed for manual filter instantiation
    private final JwtService jwtService;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final org.springframework.web.servlet.HandlerExceptionResolver handlerExceptionResolver;

    public SecurityConfig(
            AuthenticationProvider authenticationProvider,
            RateLimitFilter rateLimitFilter,
            RequestIdFilter requestIdFilter,
            JwtService jwtService,
            org.springframework.security.core.userdetails.UserDetailsService userDetailsService,
            org.springframework.web.servlet.HandlerExceptionResolver handlerExceptionResolver) {
        this.authenticationProvider = authenticationProvider;
        this.rateLimitFilter = rateLimitFilter;
        this.requestIdFilter = requestIdFilter;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.handlerExceptionResolver = handlerExceptionResolver;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf().disable()
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/index.html", "/assets/**", "/favicon.ico", "/logo.svg").permitAll()
                        .requestMatchers("/v1-api/auth/**").permitAll()
                        .requestMatchers("/v1-api/quiz/**").authenticated()
                        .requestMatchers("/v1-api/code/**").authenticated()
                        .requestMatchers("/v1-api/problems/**").permitAll()
                        .requestMatchers("/v1-api/interviews/**").authenticated()
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(requestIdFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new JwtAuthenticationFilter(jwtService, userDetailsService, handlerExceptionResolver),
                        UsernamePasswordAuthenticationFilter.class);

        logger.info("Security Filter Chain configured");
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("https://omniskill-ui.onrender.com", "http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "OPTIONS", "PUT", "DELETE")); // Add all methods you use
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Request-ID")); // Be specific
        configuration.setExposedHeaders(List.of("X-Request-ID"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply this config to all paths

        return source;
    }
}
