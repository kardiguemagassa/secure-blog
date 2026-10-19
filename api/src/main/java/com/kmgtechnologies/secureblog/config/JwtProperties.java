package com.kmgtechnologies.secureblog.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        @NotBlank String secret,
        @NotBlank String issuer,
        @Positive long expirationMinutes
) {
    @Override
    public String toString() {
        return "JwtProperties[secret=***, issuer=" + issuer + ", expirationMinutes=" + expirationMinutes + "]";
    }
}