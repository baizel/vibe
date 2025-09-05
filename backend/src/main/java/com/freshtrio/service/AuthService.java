// src/main/java/com/freshtrio/service/AuthService.java
package com.freshtrio.service;

import com.freshtrio.dto.AuthRequest;
import com.freshtrio.dto.AuthResponse;
import com.freshtrio.dto.FirebaseAuthRequest;
import com.freshtrio.dto.GoogleAuthRequest;
import com.freshtrio.dto.RegisterRequest;
import com.freshtrio.dto.UserDto;
import com.freshtrio.entity.User;
import com.freshtrio.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.google.firebase.auth.FirebaseAuthException;

import java.time.LocalDateTime;

@Service
@org.springframework.context.annotation.Profile("!dev")
public class AuthService {
    
    @Qualifier("NoOpAuthenticationManager")
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
//    @Autowired
//    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private FirebaseService firebaseService;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with email: " + request.getEmail());
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(User.Role.CUSTOMER);
        user.setIsVerified(true); // For now, auto-verify
        user.setGdprConsent(request.getGdprConsent());
        user.setGdprConsentDate(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtService.generateToken(savedUser);
        
        return new AuthResponse(token, mapToUserDto(savedUser));
    }
    
    public AuthResponse login(AuthRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        User user = (User) authentication.getPrincipal();
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        return new AuthResponse(token, mapToUserDto(user));
    }
    
    public AuthResponse refreshToken(String token) {
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String newToken = jwtService.generateToken(user);
        
        return new AuthResponse(newToken, mapToUserDto(user));
    }
    
    public void logout(String token) {
        // In a production app, you might want to blacklist the token
        // For now, we'll just let it expire naturally
    }
    
    public AuthResponse googleAuth(GoogleAuthRequest request) {
        // In a real implementation, you would verify the Google ID token here
        // For now, we'll trust the client-side verification

        // Check if user already exists
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user == null) {
            // Create new user from Google auth
            user = new User();
            user.setEmail(request.getEmail());
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setGoogleId(request.getIdToken()); // Store the Google ID
            user.setAuthProvider(User.AuthProvider.GOOGLE);
            user.setRole(User.Role.CUSTOMER);
            user.setIsVerified(true); // Google users are pre-verified
            user.setGdprConsent(true);
            user.setGdprConsentDate(LocalDateTime.now());
            
            user = userRepository.save(user);
        } else {
            // Update existing user with Google info if not already set
            if (user.getGoogleId() == null) {
                user.setGoogleId(request.getIdToken());
                user.setAuthProvider(User.AuthProvider.GOOGLE);
                user = userRepository.save(user);
            }
        }
        
        // Generate JWT token
        String token = jwtService.generateToken(user);
        
        return new AuthResponse(token, mapToUserDto(user));
    }
    
    public AuthResponse firebaseAuth(FirebaseAuthRequest request) {
        try {
            // Verify Firebase ID token
            String firebaseUid = firebaseService.getUidFromToken(request.getIdToken());
            String email = firebaseService.getEmailFromToken(request.getIdToken());
            String name = firebaseService.getNameFromToken(request.getIdToken());
            String phone = firebaseService.getPhoneFromToken(request.getIdToken());
            String provider = firebaseService.getProviderFromToken(request.getIdToken());
            
            // Split name into first and last name
            String firstName = "";
            String lastName = "";
            if (name != null && !name.isEmpty()) {
                String[] nameParts = name.trim().split("\\s+", 2);
                firstName = nameParts[0];
                if (nameParts.length > 1) {
                    lastName = nameParts[1];
                }
            }
            
            // Check if user exists by email
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                // Create new user from Firebase auth
                user = new User();
                user.setEmail(email);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setPhone(phone);
                user.setGoogleId(firebaseUid); // Store Firebase UID
                
                // Map provider to AuthProvider enum
                switch (provider.toLowerCase()) {
                    case "google.com":
                        user.setAuthProvider(User.AuthProvider.GOOGLE);
                        break;
                    case "facebook.com":
                        user.setAuthProvider(User.AuthProvider.FACEBOOK);
                        break;
                    case "apple.com":
                        user.setAuthProvider(User.AuthProvider.APPLE);
                        break;
                    default:
                        user.setAuthProvider(User.AuthProvider.EMAIL);
                        break;
                }
                
                user.setRole(User.Role.CUSTOMER);
                user.setIsVerified(true); // Firebase users are pre-verified
                user.setGdprConsent(true);
                user.setGdprConsentDate(LocalDateTime.now());
                
                user = userRepository.save(user);
            } else {
                // Update existing user with Firebase info if not already set
                if (user.getGoogleId() == null) {
                    user.setGoogleId(firebaseUid);
                    user = userRepository.save(user);
                }
            }
            
            // Generate JWT token for our backend
            String token = jwtService.generateToken(user);
            
            return new AuthResponse(token, mapToUserDto(user));
            
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Firebase token verification failed: " + e.getMessage());
        }
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