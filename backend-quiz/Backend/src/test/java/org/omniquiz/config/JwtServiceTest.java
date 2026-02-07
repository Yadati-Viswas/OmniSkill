package org.omniquiz.config;

import org.junit.jupiter.api.Test;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = JwtService.class)
@TestPropertySource(properties = {
        "security.jwt.secret-key=dGhpcy1pcy1hLXZlcnktc3Ryb25nLXNlY3JldC1rZXktZm9yLXRlc3RpbmctcHVycG9zZXM=",
        "security.jwt.expiration-time=3600000"
})
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    @Test
    void generateTokenAndExtractUsername() {
        User user = new User("Last", "First", "jwtuser", "jwt@example.com", "123", "hashed");
        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertEquals("jwtuser", jwtService.extractUsername(token));
    }
}
