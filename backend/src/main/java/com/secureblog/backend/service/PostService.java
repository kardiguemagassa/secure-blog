package com.secureblog.backend.service;

import com.secureblog.backend.dto.PostRequest;
import com.secureblog.backend.dto.PostResponse;
import com.secureblog.backend.model.Post;
import com.secureblog.backend.model.User;
import com.secureblog.backend.repository.PostRepository;
import com.secureblog.backend.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<PostResponse> listPosts() {
        return postRepository.findAllByOrderByIdDesc().stream()
                .map(post -> new PostResponse(post.getId(), post.getTitle(), post.getContent(), post.getAuthor().getUsername()))
                .toList();
    }

    public PostResponse createPost(PostRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = new Post();
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setAuthor(user);

        Post saved = postRepository.save(post);
        return new PostResponse(saved.getId(), saved.getTitle(), saved.getContent(), user.getUsername());
    }
}
