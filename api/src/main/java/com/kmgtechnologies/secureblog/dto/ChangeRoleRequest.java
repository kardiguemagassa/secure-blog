package com.kmgtechnologies.secureblog.dto;

import com.kmgtechnologies.secureblog.entity.Role;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull Role role) {}
