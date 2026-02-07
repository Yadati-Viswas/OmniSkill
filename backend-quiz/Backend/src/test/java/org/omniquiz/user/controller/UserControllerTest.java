package org.omniquiz.user.controller;

import org.junit.jupiter.api.Test;
import org.omniquiz.config.GlobalExceptionHandler;
import org.omniquiz.config.JwtService;
import org.omniquiz.user.model.User;
import org.omniquiz.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @org.springframework.boot.test.mock.mockito.MockBean
    private UserService userService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private JwtService jwtService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.omniquiz.config.RateLimitFilter rateLimitFilter;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.omniquiz.config.JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.security.authentication.AuthenticationProvider authenticationProvider;

    @Test
    void loginReturnsTokenAndUser() throws Exception {
        User user = new User("Last", "First", "testuser", "test@example.com", "123", "hashed");
        user.setId(1L);

        when(userService.login(any())).thenReturn(user);
        when(jwtService.generateToken(any())).thenReturn("token-123");
        when(jwtService.getExpirationTime()).thenReturn(3600000L);

        mockMvc.perform(post("/v1-api/auth/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"testuser\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-123"))
                .andExpect(jsonPath("$.user.username").value("testuser"));
    }

    @Test
    void loginRejectsInvalidPayload() throws Exception {
        mockMvc.perform(post("/v1-api/auth/users/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"identifier\":\"\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation failed"));
    }
}
