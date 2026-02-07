package org.omniquiz.user.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.omniquiz.user.dto.LoginRequestDTO;
import org.omniquiz.user.dto.SignupRequestDTO;
import org.omniquiz.user.dto.SignupResponseDTO;
import org.omniquiz.user.model.User;
import org.omniquiz.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private UserService userService;

    @Test
    void loginReturnsUserWhenAuthenticationSucceeds() {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setIdentifier("testuser");
        request.setPassword("password123");

        Authentication auth = new UsernamePasswordAuthenticationToken("testuser", null);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        User user = new User("Last", "First", "testuser", "test@example.com", "123", "hashed");
        when(userRepository.findByUsernameOrEmail("testuser", "testuser")).thenReturn(Optional.of(user));

        User result = userService.login(request);
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void loginReturnsNullWhenAuthenticationFails() {
        LoginRequestDTO request = new LoginRequestDTO();
        request.setIdentifier("testuser");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new org.springframework.security.authentication.BadCredentialsException("bad"));

        User result = userService.login(request);
        assertNull(result);
    }

    @Test
    void signupRejectsExistingUsername() {
        SignupRequestDTO request = new SignupRequestDTO();
        request.setUsername("taken");
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("password123");

        when(userRepository.findByUsername("taken")).thenReturn(Optional.of(new User()));

        SignupResponseDTO response = userService.signup(request);
        assertEquals(false, response.isSuccess());
        assertEquals("Username already exists", response.getMessage());
    }
}
