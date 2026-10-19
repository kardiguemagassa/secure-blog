package com.kmgtechnologies.secureblog.controller;

import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.Role;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.PostRepository;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import com.kmgtechnologies.secureblog.security.UserJwtGenerator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class PostControllerTest {

    private static final String AUTH = "Authorization";

    @Autowired private WebApplicationContext context;
    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private UserJwtGenerator userJwtGenerator;
    private MockMvc mockMvc;

    private User alice;
    private User bob;
    private User admin;
    private Post alicePost;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        alice = userRepository.save(new User("alice", "alice@example.com", "hash"));
        bob = userRepository.save(new User("bob", "bob@example.com", "hash"));

        User adminUser = new User("admin", "admin@example.com", "hash");
        adminUser.changeRole(Role.ROLE_ADMIN);
        admin = userRepository.save(adminUser);

        alicePost = postRepository.save(new Post("Post d'Alice", "Contenu d'Alice", alice));
    }

    @AfterEach
    void cleanUp() {
        postRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ===================== Lecture publique =====================

    @Nested
    class PublicRead {

        @Test
        void anonymousCanListPosts() throws Exception {
            mockMvc.perform(get("/api/posts"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content[0].title").value("Post d'Alice"))
                    .andExpect(jsonPath("$.content[0].authorUsername").value("alice"))
                    .andExpect(jsonPath("$.content[0].author").doesNotExist()) // jamais l'entité User
                    .andExpect(jsonPath("$.page.totalElements").value(1));
        }

        @Test
        void anonymousCanReadPostById() throws Exception {
            mockMvc.perform(get("/api/posts/{id}", alicePost.getId()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(alicePost.getId().toString()));
        }

        @Test
        void unknownPostReturns404() throws Exception {
            mockMvc.perform(get("/api/posts/{id}", UUID.randomUUID()))
                    .andExpect(status().isNotFound());
        }
    }

    // ===================== Création =====================

    @Nested
    class Create {

        @Test
        void anonymousCannotCreate() throws Exception {
            mockMvc.perform(post("/api/posts").contentType(MediaType.APPLICATION_JSON).content(body("T", "C")))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void userCanCreateAndIsSetAsAuthor() throws Exception {
            mockMvc.perform(post("/api/posts")
                            .header(AUTH, bearer(bob))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Post de Bob", "Contenu")))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/posts/")))
                    .andExpect(jsonPath("$.authorUsername").value("bob"))
                    .andExpect(jsonPath("$.authorId").value(bob.getId().toString()));
        }

        @Test
        void invalidBodyReturns400() throws Exception {
            mockMvc.perform(post("/api/posts")
                            .header(AUTH, bearer(bob))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("", "Contenu")))
                    .andExpect(status().isBadRequest());
        }
    }

    // ===================== Modification =====================

    @Nested
    class Update {

        @Test
        void anonymousCannotUpdate() throws Exception {
            mockMvc.perform(put("/api/posts/{id}", alicePost.getId())
                            .contentType(MediaType.APPLICATION_JSON).content(body("X", "X")))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        void ownerCanUpdate() throws Exception {
            mockMvc.perform(put("/api/posts/{id}", alicePost.getId())
                            .header(AUTH, bearer(alice))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Titre modifié", "Contenu modifié")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Titre modifié"));
        }

        @Test
        void otherUserCannotUpdate() throws Exception {
            mockMvc.perform(put("/api/posts/{id}", alicePost.getId())
                            .header(AUTH, bearer(bob))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Hack", "Hack")))
                    .andExpect(status().isForbidden());

            assertThat(postRepository.findById(alicePost.getId()).orElseThrow().getTitle())
                    .isEqualTo("Post d'Alice");
        }

        @Test
        void adminCanUpdateAnyPost() throws Exception {
            mockMvc.perform(put("/api/posts/{id}", alicePost.getId())
                            .header(AUTH, bearer(admin))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("Modéré", "Contenu modéré")))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title").value("Modéré"));
        }

        @Test
        void updatingUnknownPostReturns404NotForbidden() throws Exception {
            mockMvc.perform(put("/api/posts/{id}", UUID.randomUUID())
                            .header(AUTH, bearer(bob))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(body("X", "X")))
                    .andExpect(status().isNotFound());
        }
    }

    // ===================== Suppression =====================

    @Nested
    class Delete {

        @Test
        void ownerCanDelete() throws Exception {
            mockMvc.perform(delete("/api/posts/{id}", alicePost.getId()).header(AUTH, bearer(alice)))
                    .andExpect(status().isNoContent());

            assertThat(postRepository.existsById(alicePost.getId())).isFalse();
        }

        @Test
        void otherUserCannotDelete() throws Exception {
            mockMvc.perform(delete("/api/posts/{id}", alicePost.getId()).header(AUTH, bearer(bob)))
                    .andExpect(status().isForbidden());

            assertThat(postRepository.existsById(alicePost.getId())).isTrue();
        }

        @Test
        void adminCanDeleteAnyPost() throws Exception {
            mockMvc.perform(delete("/api/posts/{id}", alicePost.getId()).header(AUTH, bearer(admin)))
                    .andExpect(status().isNoContent());

            assertThat(postRepository.existsById(alicePost.getId())).isFalse();
        }
    }

    // ===================== Mes posts =====================

    @Nested
    class MyPosts {

        @Test
        void returnsOnlyCurrentUserPosts() throws Exception {
            postRepository.save(new Post("Post de Bob", "Contenu", bob));

            mockMvc.perform(get("/api/posts/me").header(AUTH, bearer(alice)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.page.totalElements").value(1))
                    .andExpect(jsonPath("$.content[0].authorUsername").value("alice"));
        }

        @Test
        void anonymousCannotListOwnPosts() throws Exception {
            mockMvc.perform(get("/api/posts/me"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void invalidBodyReturnsProblemDetailWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/posts")
                        .header(AUTH, bearer(bob))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("", "Contenu")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void malformedJsonReturns400() throws Exception {
        mockMvc.perform(post("/api/posts")
                        .header(AUTH, bearer(bob))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not valid json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unknownPostReturns404() throws Exception {
        mockMvc.perform(get("/api/posts/{id}", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Post not found"));
    }

    @Test
    void invalidUuidReturns400() throws Exception {
        mockMvc.perform(get("/api/posts/not-a-uuid"))
                .andExpect(status().isBadRequest());
    }

    // ===================== Helpers =====================

    private String bearer(User user) {
        return "Bearer " + userJwtGenerator.generateToken(user);
    }

    private static String body(String title, String content) {
        return """
                {"title": "%s", "content": "%s"}
                """.formatted(title, content);
    }
}