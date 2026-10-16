package com.kmgtechnologies.secureblog.dto;

import com.kmgtechnologies.secureblog.entity.Role;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String username,
        String email,
        Role role
) {}