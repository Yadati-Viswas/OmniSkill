package org.omniquiz.user.repository;

import org.junit.jupiter.api.Test;
import org.omniquiz.user.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByUsernameOrEmailReturnsUser() {
        User user = new User("Last", "First", "repoUser", "repo@example.com", "123", "hashed");
        userRepository.save(user);

        assertTrue(userRepository.findByUsernameOrEmail("repoUser", "repoUser").isPresent());
        assertTrue(userRepository.findByUsernameOrEmail("repo@example.com", "repo@example.com").isPresent());
    }
}
