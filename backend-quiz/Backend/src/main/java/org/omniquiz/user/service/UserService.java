package org.omniquiz.user.service;

import org.omniquiz.user.dto.LoginRequestDTO;
import org.omniquiz.user.dto.SignupRequestDTO;
import org.omniquiz.user.dto.SignupResponseDTO;
import org.omniquiz.user.model.User;
import org.omniquiz.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public SignupResponseDTO signup(SignupRequestDTO request) {
        log.info("Processing signup request");
        // Validate mandatory fields
        if (request.getUsername() == null || request.getEmail() == null ||
                request.getPassword() == null || request.getConfirmPassword() == null) {
            return new SignupResponseDTO(false,
                    "All mandatory fields (username, email, password, confirm password) are required", null);
        }

        // Check for existing username or email
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return new SignupResponseDTO(false, "Username already exists", null);
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new SignupResponseDTO(false, "Email already exists", null);
        }

        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            return new SignupResponseDTO(false, "Passwords do not match", null);
        }

        // Create new user
        User user = new User(
                request.getLastName(),
                request.getFirstName(),
                request.getUsername(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.info("User registered successfully. ID: {}", savedUser.getId());
        return new SignupResponseDTO(true, "Signup successful", savedUser.getId());
    }

    public User login(LoginRequestDTO request) {
        log.info("LOGIN ATTEMPT START");

        if (request.getIdentifier() == null || request.getPassword() == null) {
            log.warn("Missing identifier or password");
            return null;
        }

        try {
            log.debug("Creating authentication token");
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    request.getIdentifier(), request.getPassword());

            log.debug("Calling authenticationManager.authenticate()...");
            Authentication authenticated = authenticationManager.authenticate(authToken);

            log.info("Authentication SUCCESS");

            log.debug("Loading user after successful auth...");
            User user = userRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier())
                    .orElse(null);

            if (user == null) {
                log.error("CRITICAL: Authentication passed but user not found in DB for: '{}'",
                        request.getIdentifier());
                return null;
            }

            log.info("LOGIN SUCCESS - userId: {}", user.getId());
            return user;

        } catch (BadCredentialsException e) {
            log.warn("LOGIN FAILED - BadCredentialsException");
            return null;
        } catch (UsernameNotFoundException e) {
            log.warn("LOGIN FAILED - UsernameNotFoundException");
            return null;
        } catch (AuthenticationException e) {
            log.error("LOGIN FAILED - AuthenticationException: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("LOGIN FAILED - Unexpected exception: {}", e.getMessage(), e);
            return null;
        } finally {
            log.info("LOGIN ATTEMPT END");
        }
    }
}
