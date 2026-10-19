package com.kmgtechnologies.secureblog.service;

import com.kmgtechnologies.secureblog.dto.UserResponse;
import com.kmgtechnologies.secureblog.entity.Role;
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
public class AdminUserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public AdminUserService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional
    public UserResponse changeRole(UUID targetId, Role role, UUID adminId) {
        preventSelfAction(targetId, adminId);
        User user = userRepository.findById(targetId).orElseThrow(AdminUserService::notFound);
        user.changeRole(role);
        return UserResponse.from(user);
    }

    @Transactional
    public void delete(UUID targetId, UUID adminId) {
        preventSelfAction(targetId, adminId);
        if (!userRepository.existsById(targetId)) {
            throw notFound();
        }
        postRepository.deleteByAuthorId(targetId); // d'abord les posts, à cause de la clé étrangère
        userRepository.deleteById(targetId);
    }

    private static void preventSelfAction(UUID targetId, UUID adminId) {
        if (targetId.equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Admins cannot change their own role or delete their own account");
        }
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
}