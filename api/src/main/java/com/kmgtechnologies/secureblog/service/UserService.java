package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.AuthResponse;
import com.kmgtechnologies.secureblog.dto.LoginRequest;
import com.kmgtechnologies.secureblog.dto.RegisterRequest;
import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already in use");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(request.username(), request.email(), hashedPassword);

        User savedUser = userRepository.save(user);

        return new UserResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());
    }

    public AuthResponse login(LoginRequest request) {

        // 1. Rechercher l'utilisateur par email
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        // 2. Vérifier le mot de passe avec BCrypt
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // 3. Générer un JWT et le retourner
        String token = jwtService.generateToken(user);

        return new AuthResponse(token, "Bearer");
    }
}