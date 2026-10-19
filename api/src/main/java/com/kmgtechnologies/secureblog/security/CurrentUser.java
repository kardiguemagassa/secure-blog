package com.kmgtechnologies.secureblog.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Objects;
import java.util.UUID;

public final class CurrentUser {

    private CurrentUser() {}

    public static UUID id(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}