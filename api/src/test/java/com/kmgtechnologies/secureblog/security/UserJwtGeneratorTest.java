package com.kmgtechnologies.secureblog.security;

import com.kmgtechnologies.secureblog.config.JwtProperties;
import com.kmgtechnologies.secureblog.entity.Role;
import com.kmgtechnologies.secureblog.entity.User;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class UserJwtGeneratorTest {

    private static final String SECRET = "dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdHMtMzItYnl0ZXM=";
    private static final Instant NOW = Instant.parse("2026-01-01T10:00:00Z");

    private UserJwtGenerator userJwtGenerator;
    private NimbusJwtDecoder decoder;

    @BeforeEach
    void setUp() {
        SecretKey key = new SecretKeySpec(Base64.getDecoder().decode(SECRET), "HmacSHA256");
        Clock fixedClock = Clock.fixed(NOW, ZoneOffset.UTC);

        userJwtGenerator = new UserJwtGenerator(new NimbusJwtEncoder(new ImmutableSecret<>(key)), new JwtProperties(SECRET, "secure-blog", 60), fixedClock);

        // le décodeur doit utiliser la même horloge, sinon le token de 2026-01-01 serait vu comme expiré
        JwtTimestampValidator timestampValidator = new JwtTimestampValidator();
        timestampValidator.setClock(fixedClock);
        decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(timestampValidator);
    }

    @Test
    void shouldIssueTokenWithExpectedClaims() {
        UUID userId = UUID.randomUUID();
        User user = new User("alice", "alice@example.com", "hash");
        user.changeRole(Role.ROLE_ADMIN);
        ReflectionTestUtils.setField(user, "id", userId); // l'id est normalement généré par JPA

        Jwt jwt = decoder.decode(userJwtGenerator.generateToken(user));

        assertThat(jwt.getSubject()).isEqualTo(userId.toString());
        assertThat(jwt.getClaimAsString(JwtClaimNames.ISS)).isEqualTo("secure-blog");
        assertThat(jwt.getIssuedAt()).isEqualTo(NOW);
        assertThat(jwt.getExpiresAt()).isEqualTo(NOW.plusSeconds(3600));
        assertThat(jwt.getClaimAsString(userJwtGenerator.ROLE_CLAIM)).isEqualTo("ROLE_ADMIN");
        assertThat(jwt.getId()).isNotBlank();
        assertThat(jwt.getClaims()).doesNotContainKey("email"); // aucune donnée personnelle dans le token
    }

    @Test
    void shouldIssueUniqueTokenIds() {
        User user = new User("alice", "alice@example.com", "hash");
        ReflectionTestUtils.setField(user, "id", UUID.randomUUID());

        String first = decoder.decode(userJwtGenerator.generateToken(user)).getId();
        String second = decoder.decode(userJwtGenerator.generateToken(user)).getId();

        assertThat(first).isNotEqualTo(second);
    }
}