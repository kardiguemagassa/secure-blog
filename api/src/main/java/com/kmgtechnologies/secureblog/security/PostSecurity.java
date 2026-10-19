package com.kmgtechnologies.secureblog.security;

import com.kmgtechnologies.secureblog.repository.PostRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("postSecurity")
public class PostSecurity {

    private final PostRepository postRepository;

    public PostSecurity(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public boolean isOwner(UUID postId, Authentication authentication) {
        if (!postRepository.existsById(postId)) {
            return true; // on laisse le service renvoyer 404 plutôt qu'un 403 trompeur
        }
        return postRepository.existsByIdAndAuthorId(postId, UUID.fromString(authentication.getName()));
    }
}