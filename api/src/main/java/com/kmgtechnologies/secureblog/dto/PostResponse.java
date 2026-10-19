package com.kmgtechnologies.secureblog.dto;

import com.kmgtechnologies.secureblog.entity.Post;

import java.time.Instant;
import java.util.UUID;

public record PostResponse(UUID id, String title, String content, UUID authorId, String authorUsername, Instant createdAt, Instant updatedAt) {

    public static PostResponse from(Post post) {
        return new PostResponse(post.getId(), post.getTitle(), post.getContent(),
                post.getAuthor().getId(), post.getAuthor().getUsername(),
                post.getCreatedAt(), post.getUpdatedAt());
    }
}