package org.omniquiz.user.controller;

import org.omniquiz.user.dto.LoginRequestDTO;
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

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponseDTO> signup(@Valid @RequestBody SignupRequestDTO request) {
        SignupResponseDTO response = userService.signup(request);
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        User userCheck = userService.login(request);
        if(userCheck==null) {
            return ResponseEntity.status(401).build();
        }
        String token = jwtService.generateToken(userCheck);
        long expiresIn = jwtService.getExpirationTime();
        LoginResponseDTO loginResponse = new LoginResponseDTO(true,token, expiresIn, userCheck);
        return ResponseEntity.ok(loginResponse);

    }

    public User getUserDetails(@AuthenticationPrincipal User user){
        return user;
    }
}
