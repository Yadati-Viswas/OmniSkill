package org.omniquiz.user.controller;

import org.omniquiz.user.dto.LoginRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.omniquiz.user.dto.LoginResponseDTO;
import org.omniquiz.user.dto.SignupRequestDTO;
import org.omniquiz.user.dto.SignupResponseDTO;
import org.omniquiz.user.model.User;
import org.omniquiz.user.service.UserService;
import org.omniquiz.config.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1-api/auth/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDTO> signup(@Valid @RequestBody SignupRequestDTO request) {
        logger.info("Signup attempt received");
        SignupResponseDTO response = userService.signup(request);
        if (response.isSuccess()) {
            logger.info("Signup successful");
            return ResponseEntity.ok(response);
        } else {
            logger.warn("Signup failed");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        logger.info("Login attempt received");
        User userCheck = userService.login(request);
        if (userCheck == null) {
            logger.warn("Login failed");
            return ResponseEntity.status(401).build();
        }
        logger.info("Login successful");
        String token = jwtService.generateToken(userCheck);
        long expiresIn = jwtService.getExpirationTime();
        LoginResponseDTO loginResponse = new LoginResponseDTO(true, token, expiresIn, userCheck);
        return ResponseEntity.ok(loginResponse);

    }

    public User getUserDetails(@AuthenticationPrincipal User user) {
        return user;
    }
}
