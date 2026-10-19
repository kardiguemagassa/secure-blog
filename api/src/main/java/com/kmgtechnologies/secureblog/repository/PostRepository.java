package com.kmgtechnologies.secureblog.repository;

import com.kmgtechnologies.secureblog.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {
}
