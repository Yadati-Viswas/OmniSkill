package org.omniquiz.user.service;

import org.omniquiz.user.dto.LoginRequestDTO;
import org.omniquiz.user.dto.LoginResponseDTO;
import org.omniquiz.user.dto.SignupRequestDTO;
import org.omniquiz.user.dto.SignupResponseDTO;
import org.omniquiz.user.model.User;
import org.omniquiz.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private final AuthenticationManager authenticationManager;

    private final BCryptPasswordEncoder passwordBcyrpt = new BCryptPasswordEncoder();

    public UserService(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public SignupResponseDTO signup(SignupRequestDTO request) {
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
        return new SignupResponseDTO(true, "Signup successful", savedUser.getId());
    }

    public User login(LoginRequestDTO request) {
        log.info("LOGIN ATTEMPT START - identifier: '{}'", request.getIdentifier());

        if (request.getIdentifier() == null || request.getPassword() == null) {
            log.warn("Missing identifier or password");
            return null;
        }

        try {
            log.debug("Creating authentication token for: '{}'", request.getIdentifier());
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    request.getIdentifier(), request.getPassword());

            log.debug("Calling authenticationManager.authenticate()...");
            Authentication authenticated = authenticationManager.authenticate(authToken);

            log.info("Authentication SUCCESS for principal: {}", authenticated.getName());

            log.debug("Loading user after successful auth...");
            User user = userRepository.findByUsernameOrEmail(request.getIdentifier(), request.getIdentifier())
                    .orElse(null);

            if (user == null) {
                log.error("CRITICAL: Authentication passed but user not found in DB for: '{}'",
                        request.getIdentifier());
                return null;
            }

            log.info("LOGIN SUCCESS - user: {}, email: {}", user.getUsername(), user.getEmail());
            return user;

        } catch (BadCredentialsException e) {
            log.warn("LOGIN FAILED - BadCredentialsException: Invalid password for '{}'", request.getIdentifier());
            return null;
        } catch (UsernameNotFoundException e) {
            log.warn("LOGIN FAILED - UsernameNotFoundException: User not found '{}'", request.getIdentifier());
            return null;
        } catch (AuthenticationException e) {
            log.error("LOGIN FAILED - AuthenticationException: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            log.error("LOGIN FAILED - Unexpected exception for '{}': {}", request.getIdentifier(), e.getMessage(), e);
            return null;
        } finally {
            log.info("LOGIN ATTEMPT END for '{}'", request.getIdentifier());
        }
    }
}
