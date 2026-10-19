package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.AuthResponse;
import com.kmgtechnologies.secureblog.dto.LoginRequest;
import com.kmgtechnologies.secureblog.dto.RegisterRequest;
import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import com.kmgtechnologies.secureblog.security.UserJwtGenerator;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserJwtGenerator userJwtGenerator;
    private final String dummyHash;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, UserJwtGenerator userJwtGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userJwtGenerator = userJwtGenerator;
        this.dummyHash = passwordEncoder.encode("timing-attack-protection");
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = User.normalizeEmail(request.email());
        String username = request.username().trim();

        if (userRepository.existsByEmail(email)) {
            throw conflict("Email already in use");
        }
        if (userRepository.existsByUsername(username)) {
            throw conflict("Username already in use");
        }

        User user = new User(username, email, passwordEncoder.encode(request.password()));

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            throw conflict("Email or username already in use");
        }

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Optional<User> user = userRepository.findByEmail(User.normalizeEmail(request.email()));

        // BCrypt est toujours exécuté : temps de réponse identique, que l'email existe ou non
        String hash = user.map(User::getPassword).orElse(dummyHash);
        boolean passwordMatches = passwordEncoder.matches(request.password(), hash);

        if (user.isEmpty() || !passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new AuthResponse(userJwtGenerator.generateToken(user.get()), "Bearer");
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User no longer exists"));
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}