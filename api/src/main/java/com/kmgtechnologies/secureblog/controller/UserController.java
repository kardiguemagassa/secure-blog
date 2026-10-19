package com.kmgtechnologies.secureblog.controller;

import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.security.CurrentUser;
import com.kmgtechnologies.secureblog.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Users", description = "Authenticated user's own profile")
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return userService.getById(CurrentUser.id(jwt));
    }
}