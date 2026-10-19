package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.AuthResponse;
import com.kmgtechnologies.secureblog.dto.LoginRequest;
import com.kmgtechnologies.secureblog.dto.RegisterRequest;
import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.entity.Role;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import com.kmgtechnologies.secureblog.security.UserJwtGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    private static final String DUMMY_HASH = "dummy-hash";

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserJwtGenerator userJwtGenerator;

    private UserService userService;
    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        when(passwordEncoder.encode(anyString())).thenReturn(DUMMY_HASH); // consommé par le constructeur
        userService = new UserService(userRepository, passwordEncoder, userJwtGenerator);
        request = new RegisterRequest("alice", "alice@example.com", "TestPassword123!");
    }

    // ---------- register ----------

    @Test
    void shouldRegisterUserSuccessfully() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(passwordEncoder.encode("TestPassword123!")).thenReturn("hashed-password");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.register(request);

        assertEquals("alice", response.username());
        assertEquals("alice@example.com", response.email());
        assertEquals(Role.ROLE_USER, response.role());
        verify(userRepository).saveAndFlush(argThat(u -> u.getPassword().equals("hashed-password")));
    }

    @Test
    void shouldNormalizeEmailAndUsernameOnRegister() {
        RegisterRequest mixed = new RegisterRequest("  alice ", "  Alice@Example.COM ", "TestPassword123!");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.register(mixed);

        assertEquals("alice@example.com", response.email());
        assertEquals("alice", response.username());
    }

    @Test
    void shouldRejectDuplicateEmail() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userService.register(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email already in use", ex.getReason());
        verify(userRepository, never()).saveAndFlush(any());
        verify(passwordEncoder, never()).encode(request.password());
    }

    @Test
    void shouldRejectDuplicateUsername() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userService.register(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Username already in use", ex.getReason());
        verify(userRepository, never()).saveAndFlush(any());
        verify(passwordEncoder, never()).encode(request.password());
    }

    @Test
    void shouldReturnConflictWhenConcurrentRegistrationViolatesUniqueConstraint() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.saveAndFlush(any(User.class)))
                .thenThrow(new DataIntegrityViolationException("duplicate key"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> userService.register(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    // ---------- login ----------

    @Test
    void shouldLoginSuccessfully() {
        User user = new User("alice", "alice@example.com", "hashed-password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("TestPassword123!", "hashed-password")).thenReturn(true);
        when(userJwtGenerator.generateToken(user)).thenReturn("test-jwt-token");

        AuthResponse response = userService.login(new LoginRequest("alice@example.com", "TestPassword123!"));

        assertEquals("test-jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
    }

    @Test
    void shouldNormalizeEmailOnLogin() {
        User user = new User("alice", "alice@example.com", "hashed-password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("TestPassword123!", "hashed-password")).thenReturn(true);
        when(userJwtGenerator.generateToken(user)).thenReturn("test-jwt-token");

        AuthResponse response = userService.login(new LoginRequest("  Alice@Example.COM ", "TestPassword123!"));

        assertEquals("test-jwt-token", response.accessToken());
    }

    @Test
    void shouldRejectLoginWithInvalidPassword() {
        User user = new User("alice", "alice@example.com", "hashed-password");
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed-password")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.login(new LoginRequest("alice@example.com", "wrongpassword")));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verifyNoInteractions(userJwtGenerator);
    }

    @Test
    void shouldRunBcryptAgainstDummyHashWhenEmailUnknown() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> userService.login(new LoginRequest("ghost@example.com", "whatever")));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Invalid credentials", ex.getReason()); // même message : pas d'indice sur l'existence du compte
        verify(passwordEncoder).matches("whatever", DUMMY_HASH);
        verifyNoInteractions(userJwtGenerator);
    }
}