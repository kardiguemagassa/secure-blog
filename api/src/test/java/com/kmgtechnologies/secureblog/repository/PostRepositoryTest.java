package com.kmgtechnologies.secureblog.repository;

import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.User;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PostRepositoryTest {

    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EntityManager em;

    private User alice;
    private User bob;

    @BeforeEach
    void setUp() {
        alice = userRepository.save(new User("alice", "alice@example.com", "hash"));
        bob = userRepository.save(new User("bob", "bob@example.com", "hash"));
    }

    @Test
    void shouldPersistPostWithTimestamps() {
        Post saved = postRepository.saveAndFlush(new Post("Mon premier article", "Contenu", alice));
        em.clear();

        Post found = postRepository.findById(saved.getId()).orElseThrow();

        assertThat(found.getTitle()).isEqualTo("Mon premier article");
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getUpdatedAt()).isNotNull();
    }

    @Test
    void shouldFetchAuthorWithEntityGraph() {
        Post saved = postRepository.saveAndFlush(new Post("Titre", "Contenu", alice));
        em.clear();

        Post found = postRepository.findWithAuthorById(saved.getId()).orElseThrow();

        assertThat(Hibernate.isInitialized(found.getAuthor())).isTrue();
    }

    @Test
    void shouldCheckOwnership() {
        Post saved = postRepository.saveAndFlush(new Post("Titre", "Contenu", alice));

        assertThat(postRepository.existsByIdAndAuthorId(saved.getId(), alice.getId())).isTrue();
        assertThat(postRepository.existsByIdAndAuthorId(saved.getId(), bob.getId())).isFalse();
    }

    @Test
    void shouldListOnlyPostsOfGivenAuthor() {
        postRepository.save(new Post("a1", "c", alice));
        postRepository.save(new Post("a2", "c", alice));
        postRepository.saveAndFlush(new Post("b1", "c", bob));

        Page<Post> page =postRepository.findByAuthorIdOrderByCreatedAtDesc(alice.getId(), PageRequest.of(0, 10));
        assertThat(page.getTotalElements()).isEqualTo(2);
        assertThat(page.getContent()).extracting(Post::getTitle).containsExactlyInAnyOrder("a1", "a2");
    }

    @Test
    void shouldDeleteAllPostsOfGivenAuthorOnly() {
        postRepository.save(new Post("a1", "c", alice));
        postRepository.save(new Post("a2", "c", alice));
        Post bobPost = postRepository.saveAndFlush(new Post("b1", "c", bob));

        int deleted = postRepository.deleteByAuthorId(alice.getId());

        assertThat(deleted).isEqualTo(2);
        assertThat(postRepository.findAll())
                .extracting(Post::getId)
                .containsExactly(bobPost.getId());
    }
}