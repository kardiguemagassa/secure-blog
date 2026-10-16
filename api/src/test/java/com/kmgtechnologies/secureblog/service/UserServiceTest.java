package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.RegisterRequest;
import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private RegisterRequest request;

    @BeforeEach
    void setUp() {
        request = new RegisterRequest("alice", "alice@example.com", "TestPassword123!");
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        when(userRepository.existsByEmail(request.email())).thenReturn(false);

        when(userRepository.existsByUsername(request.username())).thenReturn(false);

        when(passwordEncoder.encode(request.password())).thenReturn("hashed-password");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.register(request);

        assertEquals("alice", response.username());
        assertEquals("alice@example.com", response.email());
        assertEquals("ROLE_USER", response.role().name());

        verify(passwordEncoder).encode("TestPassword123!");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldRejectDuplicateEmail() {
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> userService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("Email already in use", exception.getReason());

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void shouldRejectDuplicateUsername() {
        when(userRepository.existsByEmail(request.email())).thenReturn(false);

        when(userRepository.existsByUsername(request.username())).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> userService.register(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("Username already in use", exception.getReason());

        verify(userRepository, never()).save(any(User.class));
        verifyNoInteractions(passwordEncoder);
    }
}