package com.kmgtechnologies.secureblog.repository;

import com.kmgtechnologies.secureblog.entity.Role;
import com.kmgtechnologies.secureblog.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindUserByEmail() {
        User user = new User("testuser", "test@example.com", "hashed-password");

        userRepository.saveAndFlush(user);

        var foundUser = userRepository.findByEmail("test@example.com");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
        assertThat(foundUser.get().getRole()).isEqualTo(Role.ROLE_USER);
        assertThat(foundUser.get().getId()).isNotNull();
    }

    @Test
    void shouldCheckEmailAndUsernameExistence() {
        User user = new User("anotheruser", "another@example.com", "hashed-password");

        userRepository.saveAndFlush(user);

        assertThat(userRepository.existsByEmail("another@example.com")).isTrue();
        assertThat(userRepository.existsByUsername("anotheruser")).isTrue();
        assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
    }

    @Test
    void shouldNormalizeEmailOnCreation() {
        userRepository.saveAndFlush(new User("mixed", "  Mixed@Example.COM ", "hash"));

        assertThat(userRepository.findByEmail("mixed@example.com")).isPresent();
    }

    @Test
    void shouldRejectDuplicateEmailAndUsername() {
        userRepository.saveAndFlush(new User("u1", "dup@example.com", "hash"));

        assertThatThrownBy(() -> userRepository.saveAndFlush(new User("u2", "dup@example.com", "hash")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}