package com.kmgtechnologies.secureblog.controller;

import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.Role;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.PostRepository;
import com.kmgtechnologies.secureblog.repository.UserRepository;

import com.kmgtechnologies.secureblog.security.UserJwtGenerator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AdminUserControllerTest {

    private static final String AUTH = "Authorization";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private UserJwtGenerator userJwtGenerator;

    private MockMvc mockMvc;
    private User alice;
    private User admin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
        alice = userRepository.save(new User("alice", "alice@example.com", "hash"));
        User adminUser = new User("admin", "admin@example.com", "hash");
        adminUser.changeRole(Role.ROLE_ADMIN);
        admin = userRepository.save(adminUser);
    }

    @AfterEach
    void cleanUp() {
        postRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void anonymousGets401() throws Exception {
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void regularUserGets403() throws Exception {
        mockMvc.perform(get("/api/admin/users").header(AUTH, bearer(alice)))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanListUsersWithoutPasswords() throws Exception {
        mockMvc.perform(get("/api/admin/users").header(AUTH, bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].password").doesNotExist());
    }

    @Test
    void adminCanPromoteUser() throws Exception {
        mockMvc.perform(patch("/api/admin/users/{id}/role", alice.getId())
                        .header(AUTH, bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\": \"ROLE_ADMIN\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"));

        assertThat(userRepository.findById(alice.getId()).orElseThrow().getRole()).isEqualTo(Role.ROLE_ADMIN);
    }

    @Test
    void unknownRoleReturns400() throws Exception {
        mockMvc.perform(patch("/api/admin/users/{id}/role", alice.getId())
                        .header(AUTH, bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\": \"ROLE_GOD\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminCannotChangeOwnRole() throws Exception {
        mockMvc.perform(patch("/api/admin/users/{id}/role", admin.getId())
                        .header(AUTH, bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\": \"ROLE_USER\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void adminCanDeleteUserAndTheirPosts() throws Exception {
        Post post = postRepository.save(new Post("Post d'Alice", "Contenu", alice));

        mockMvc.perform(delete("/api/admin/users/{id}", alice.getId()).header(AUTH, bearer(admin)))
                .andExpect(status().isNoContent());

        assertThat(userRepository.existsById(alice.getId())).isFalse();
        assertThat(postRepository.existsById(post.getId())).isFalse();
    }

    @Test
    void adminCannotDeleteThemselves() throws Exception {
        mockMvc.perform(delete("/api/admin/users/{id}", admin.getId()).header(AUTH, bearer(admin)))
                .andExpect(status().isConflict());
    }

    @Test
    void deletingUnknownUserReturns404() throws Exception {
        mockMvc.perform(delete("/api/admin/users/{id}", UUID.randomUUID()).header(AUTH, bearer(admin)))
                .andExpect(status().isNotFound());
    }

    private String bearer(User user) {
        return "Bearer " + userJwtGenerator.generateToken(user);
    }
}