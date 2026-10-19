package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.PostRequest;
import com.kmgtechnologies.secureblog.dto.PostResponse;
import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.PostRepository;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private UserRepository userRepository;
    @InjectMocks private PostService postService;

    private final UUID authorId = UUID.randomUUID();
    private final UUID postId = UUID.randomUUID();
    private User alice;

    @BeforeEach
    void setUp() {
        alice = new User("alice", "alice@example.com", "hash");
    }

    @Test
    void shouldCreatePostWithAuthenticatedAuthor() {
        when(userRepository.findById(authorId)).thenReturn(Optional.of(alice));
        when(postRepository.save(any(Post.class))).thenAnswer(inv -> inv.getArgument(0));

        PostResponse response = postService.create(new PostRequest("  Titre  ", "Contenu"), authorId);

        assertEquals("Titre", response.title());
        assertEquals("alice", response.authorUsername());
    }

    @Test
    void shouldReturnUnauthorizedWhenAuthorNoLongerExists() {
        when(userRepository.findById(authorId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> postService.create(new PostRequest("Titre", "Contenu"), authorId));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldReturnNotFoundWhenPostMissing() {
        when(postRepository.findWithAuthorById(postId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> postService.findById(postId));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void shouldUpdatePostAndFlush() {
        Post post = new Post("Ancien", "Ancien contenu", alice);
        when(postRepository.findWithAuthorById(postId)).thenReturn(Optional.of(post));

        PostResponse response = postService.update(postId, new PostRequest("Nouveau", "Nouveau contenu"));

        assertEquals("Nouveau", response.title());
        assertEquals("Nouveau contenu", response.content());
        verify(postRepository).flush();
    }

    @Test
    void shouldReturnNotFoundWhenDeletingMissingPost() {
        when(postRepository.existsById(postId)).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> postService.delete(postId));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(postRepository, never()).deleteById(any());
    }

    @Test
    void shouldDeleteExistingPost() {
        when(postRepository.existsById(postId)).thenReturn(true);

        postService.delete(postId);

        verify(postRepository).deleteById(postId);
    }
}