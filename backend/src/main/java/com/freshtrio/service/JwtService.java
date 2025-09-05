package com.freshtrio.service;

import com.freshtrio.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    @Autowired
    private JwtEncoder jwtEncoder;

    @Autowired
    private JwtDecoder jwtDecoder;

    @Autowired
    private JwsHeader jwsHeader;

    @Value("${jwt.expiration:86400}") // 24 hours in seconds
    private long jwtExpirationInSeconds;

    public String generateToken(User user) {
        Instant now = Instant.now();
        Instant expiration = now.plus(jwtExpirationInSeconds, ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("freshtrio-api")
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("googleid", user.getGoogleId())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public String extractUsername(String token) {
        // Remove Bearer prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getSubject();
    }

    public String extractRole(String token) {
        // Remove Bearer prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getClaimAsString("role");
    }

    public boolean isTokenValid(String token) {
        try {
            // Remove Bearer prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            Jwt jwt = jwtDecoder.decode(token);
            return !jwt.getExpiresAt().isBefore(Instant.now());
        } catch (JwtException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            // Remove Bearer prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getExpiresAt().isBefore(Instant.now());
        } catch (JwtException e) {
            return true;
        }
    }
}