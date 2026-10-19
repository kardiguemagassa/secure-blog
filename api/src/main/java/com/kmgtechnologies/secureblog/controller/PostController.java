package com.kmgtechnologies.secureblog.controller;

import com.kmgtechnologies.secureblog.dto.PostRequest;
import com.kmgtechnologies.secureblog.dto.PostResponse;
import com.kmgtechnologies.secureblog.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final String OWNER_OR_ADMIN =
            "hasRole('ADMIN') or @postSecurity.isOwner(#id, authentication)";

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // ----- public -----

    @GetMapping
    public PagedModel<PostResponse> findAll(@PageableDefault(size = 10) Pageable pageable) {
        return new PagedModel<>(postService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public PostResponse findById(@PathVariable UUID id) {
        return postService.findById(id);
    }

    // ----- authentifié -----

    @GetMapping("/me")
    public PagedModel<PostResponse> myPosts(@AuthenticationPrincipal Jwt jwt,
                                            @PageableDefault(size = 10) Pageable pageable) {
        return new PagedModel<>(postService.findByAuthor(currentUserId(jwt), pageable));
    }

    @PostMapping
    public ResponseEntity<PostResponse> create(@AuthenticationPrincipal Jwt jwt,
                                               @Valid @RequestBody PostRequest request) {
        PostResponse created = postService.create(request, currentUserId(jwt));
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize(OWNER_OR_ADMIN)
    public PostResponse update(@PathVariable UUID id, @Valid @RequestBody PostRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(OWNER_OR_ADMIN)
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}