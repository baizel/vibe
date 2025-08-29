package com.freshtrio.security;

import com.freshtrio.entity.User;

public class JwtTokenProvider {
    public String createToken(String email, User.Role role) {
        return "";
    }

    public String getUsername(String bearer) {
        return "superHacker";
    }
}
