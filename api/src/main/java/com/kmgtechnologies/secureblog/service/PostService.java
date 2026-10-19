package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.PostRequest;
import com.kmgtechnologies.secureblog.dto.PostResponse;
import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.User;
import com.kmgtechnologies.secureblog.repository.PostRepository;
import com.kmgtechnologies.secureblog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Page<PostResponse> findAll(Pageable pageable) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable).map(PostResponse::from);
    }

    public Page<PostResponse> findByAuthor(UUID authorId, Pageable pageable) {
        return postRepository.findByAuthorIdOrderByCreatedAtDesc(authorId, pageable).map(PostResponse::from);
    }

    public PostResponse findById(UUID id) {
        return PostResponse.from(getPost(id));
    }

    @Transactional
    public PostResponse create(PostRequest request, UUID authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User no longer exists"));

        Post saved = postRepository.save(new Post(request.title().trim(), request.content(), author));
        return PostResponse.from(saved);
    }

    @Transactional
    public PostResponse update(UUID id, PostRequest request) {
        Post post = getPost(id);
        post.update(request.title().trim(), request.content());
        postRepository.flush(); // déclenche @UpdateTimestamp avant de construire la réponse
        return PostResponse.from(post);
    }

    @Transactional
    public void delete(UUID id) {
        if (!postRepository.existsById(id)) {
            throw notFound();
        }
        postRepository.deleteById(id);
    }

    private Post getPost(UUID id) {
        return postRepository.findWithAuthorById(id).orElseThrow(PostService::notFound);
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
    }
}