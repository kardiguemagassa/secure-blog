package com.kmgtechnologies.secureblog.repository;

import com.kmgtechnologies.secureblog.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @EntityGraph(attributePaths = "author")
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Optional<Post> findWithAuthorById(UUID id);

    boolean existsByIdAndAuthorId(UUID id, UUID authorId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from Post p where p.author.id = :authorId")
    int deleteByAuthorId(@Param("authorId") UUID authorId);
}