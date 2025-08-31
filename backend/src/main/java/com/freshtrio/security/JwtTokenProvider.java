package com.freshtrio.security;

import com.freshtrio.entity.User;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    public String createToken(String email, User.Role role) {
        return "";
    }

    public String getUsername(String bearer) {
        return "superHacker";
    }
}
