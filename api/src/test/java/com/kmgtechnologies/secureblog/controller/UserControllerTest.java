package com.kmgtechnologies.secureblog.controller;

import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.PostRepository;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import com.kmgtechnologies.secureblog.service.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class UserControllerTest {

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private JwtService jwtService;
    @Autowired private JwtEncoder jwtEncoder;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void cleanUp() {
        postRepository.deleteAll(); // les posts d'abord, à cause de la clé étrangère
        userRepository.deleteAll();
    }

    @Test
    void shouldRejectRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectMalformedToken() throws Exception {
        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectTokenWithTamperedSignature() throws Exception {
        String token = jwtService.generateToken(saveUser());
        String tampered = token.substring(0, token.lastIndexOf('.') + 1) + "dGFtcGVyZWQtc2lnbmF0dXJl";

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + tampered))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectExpiredToken() throws Exception {
        String token = expiredTokenFor(saveUser());

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectValidTokenOfDeletedUser() throws Exception {
        User user = saveUser();
        String token = jwtService.generateToken(user);
        userRepository.delete(user);

        mockMvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnCurrentUserWithValidToken() throws Exception {
        String token = jwtService.generateToken(saveUser());

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jwt-test-user"))
                .andExpect(jsonPath("$.email").value("jwt-test@example.com"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    // ---------- helpers ----------

    private User saveUser() {
        return userRepository.save(new User("jwt-test-user", "jwt-test@example.com", "hashed-password"));
    }

    private String expiredTokenFor(User user) {
        Instant issuedAt = Instant.now().minus(1, ChronoUnit.HOURS);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("secure-blog")
                .subject(user.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plus(5, ChronoUnit.MINUTES)) // expiré depuis 55 min, bien au-delà des 60 s de tolérance
                .claim("role", user.getRole().name())
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}