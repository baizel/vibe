package com.freshtrio.service;

import com.freshtrio.dto.AuthResponse;
import com.freshtrio.dto.FirebaseAuthRequest;
import com.freshtrio.dto.RegisterRequest;
import com.freshtrio.entity.User;
import com.freshtrio.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuthException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private FirebaseService firebaseService;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setRole(User.Role.CUSTOMER);
        testUser.setIsVerified(true);
        testUser.setGdprConsent(true);
        testUser.setGdprConsentDate(LocalDateTime.now());
    }

    @Test
    void register_ShouldCreateNewUser_WhenEmailNotExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPhone("1234567890");
        request.setGdprConsent(true);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertNotNull(response.getUser());
        assertEquals("test@example.com", response.getUser().getEmail());

        verify(userRepository).findByEmail(request.getEmail());
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    void register_ShouldThrowException_WhenEmailAlreadyExists() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.register(request));
        verify(userRepository).findByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void firebaseAuth_ShouldCreateNewUser_WhenEmailNotExists() throws FirebaseAuthException {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("mock-firebase-token");

        when(firebaseService.getUidFromToken(request.getIdToken())).thenReturn("firebase-uid");
        when(firebaseService.getEmailFromToken(request.getIdToken())).thenReturn("firebase@example.com");
        when(firebaseService.getNameFromToken(request.getIdToken())).thenReturn("Firebase User");
        when(firebaseService.getPhoneFromToken(request.getIdToken())).thenReturn(null);
        when(firebaseService.getProviderFromToken(request.getIdToken())).thenReturn("google.com");

        when(userRepository.findByEmail("firebase@example.com")).thenReturn(Optional.empty());
        
        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        newUser.setEmail("firebase@example.com");
        newUser.setFirstName("Firebase");
        newUser.setLastName("User");
        newUser.setGoogleId("firebase-uid");
        newUser.setAuthProvider(User.AuthProvider.GOOGLE);
        newUser.setRole(User.Role.CUSTOMER);
        
        when(userRepository.save(any(User.class))).thenReturn(newUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token");

        // Act
        AuthResponse response = authService.firebaseAuth(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        assertNotNull(response.getUser());
        assertEquals("firebase@example.com", response.getUser().getEmail());

        verify(firebaseService).getUidFromToken(request.getIdToken());
        verify(firebaseService).getEmailFromToken(request.getIdToken());
        verify(userRepository).findByEmail("firebase@example.com");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(newUser);
    }

    @Test
    void firebaseAuth_ShouldUpdateExistingUser_WhenEmailExists() throws FirebaseAuthException {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("mock-firebase-token");

        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("existing@example.com");
        existingUser.setGoogleId(null);

        when(firebaseService.getUidFromToken(request.getIdToken())).thenReturn("firebase-uid");
        when(firebaseService.getEmailFromToken(request.getIdToken())).thenReturn("existing@example.com");
        when(firebaseService.getNameFromToken(request.getIdToken())).thenReturn("Existing User");
        when(firebaseService.getPhoneFromToken(request.getIdToken())).thenReturn(null);
        when(firebaseService.getProviderFromToken(request.getIdToken())).thenReturn("google.com");

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mock-jwt-token");

        // Act
        AuthResponse response = authService.firebaseAuth(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.getAccessToken());
        verify(userRepository).save(existingUser);
        assertEquals("firebase-uid", existingUser.getGoogleId());
    }

    @Test
    void firebaseAuth_ShouldThrowException_WhenFirebaseTokenInvalid() throws FirebaseAuthException {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("invalid-token");

        FirebaseAuthException mockException = mock(FirebaseAuthException.class);
        when(mockException.getMessage()).thenReturn("Invalid token");
        when(firebaseService.getUidFromToken(request.getIdToken())).thenThrow(mockException);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> authService.firebaseAuth(request));
        
        assertTrue(exception.getMessage().contains("Firebase token verification failed"));
        verify(firebaseService).getUidFromToken(request.getIdToken());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void refreshToken_ShouldReturnNewToken_WhenUserExists() {
        // Arrange
        String oldToken = "old-token";
        when(jwtService.extractUsername(oldToken)).thenReturn("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any())).thenReturn("new-token");

        // Act
        AuthResponse response = authService.refreshToken(oldToken);

        // Assert
        assertNotNull(response);
        assertEquals("new-token", response.getAccessToken());
        assertEquals("test@example.com", response.getUser().getEmail());

        verify(jwtService).extractUsername(oldToken);
        verify(userRepository).findByEmail("test@example.com");
        verify(jwtService).generateToken(any(User.class));
    }

    @Test
    void refreshToken_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        String oldToken = "old-token";
        when(jwtService.extractUsername(oldToken)).thenReturn("nonexistent@example.com");
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authService.refreshToken(oldToken));
        
        verify(jwtService).extractUsername(oldToken);
        verify(userRepository).findByEmail("nonexistent@example.com");
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void logout_ShouldExecuteWithoutException() {
        // Act & Assert
        assertDoesNotThrow(() -> authService.logout("any-token"));
    }
}