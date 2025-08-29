// src/main/java/com/freshtrio/service/AuthService.java
package com.freshtrio.service;

import com.freshtrio.dto.AuthRequest;
import com.freshtrio.dto.AuthResponse;
import com.freshtrio.dto.RegisterRequest;
import com.freshtrio.dto.UserDto;
import com.freshtrio.entity.User;
import com.freshtrio.repository.UserRepository;
import com.freshtrio.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(User.Role.CUSTOMER);
        user.setIsVerified(true); // For now, auto-verify
        user.setGdprConsent(request.getGdprConsent());
        user.setGdprConsentDate(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtTokenProvider.createToken(savedUser.getEmail(), savedUser.getRole());
        
        return new AuthResponse(token, mapToUserDto(savedUser));
    }
    
    public AuthResponse login(AuthRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = (User) authentication.getPrincipal();
        
        // Generate JWT token
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        
        return new AuthResponse(token, mapToUserDto(user));
    }
    
    public AuthResponse refreshToken(String token) {
        String email = jwtTokenProvider.getUsername(token.replace("Bearer ", ""));
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newToken = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        
        return new AuthResponse(newToken, mapToUserDto(user));
    }
    
    public void logout(String token) {
        // In a production app, you might want to blacklist the token
        // For now, we'll just let it expire naturally
    }
    
    private UserDto mapToUserDto(User user) {
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name().toLowerCase()
        );
    }
}