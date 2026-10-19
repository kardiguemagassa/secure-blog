 package com.kmgtechnologies.secureblog.repository;

import com.kmgtechnologies.secureblog.entity.Post;
import com.kmgtechnologies.secureblog.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PostRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldSaveAndFindPost() {
        User author = new User("post-author", "post-author@example.com", "hashed-password");
        author = userRepository.save(author);

        Post post = new Post("Mon premier article", "Contenu de test", author);

        Post savedPost = postRepository.save(post);

        assertThat(savedPost.getId()).isNotNull();
        assertThat(postRepository.findById(savedPost.getId()))
                .isPresent()
                .get()
                .extracting(Post::getTitle)
                .isEqualTo("Mon premier article");
    }
}