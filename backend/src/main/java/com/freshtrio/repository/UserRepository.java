package com.freshtrio.repository;

import com.freshtrio.entity.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepository {
    public Optional<User> findByEmail(String email) {
        return null;
    }

    public User save(User user) {
        return null;
    }
}
