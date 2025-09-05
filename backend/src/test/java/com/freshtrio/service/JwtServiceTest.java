package com.freshtrio.service;

import com.freshtrio.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private JwtDecoder jwtDecoder;

    @InjectMocks
    private JwtService jwtService;

    private Jwt mockJwt;
    private Instant now;
    private Instant expiration;

    @BeforeEach
    void setUp() {
        // Set JWT expiration to 24 hours for testing
        ReflectionTestUtils.setField(jwtService, "jwtExpirationInSeconds", 86400L);
        
        now = Instant.now();
        expiration = now.plus(24, ChronoUnit.HOURS);
        
        // Mock JWT - will be configured in individual tests
        mockJwt = mock(Jwt.class);
    }

    @Test
    void generateToken_ShouldReturnValidToken_WhenValidInputProvided() {
        // Arrange
        String email = "test@example.com";
        User.Role role = User.Role.CUSTOMER;
        
        Jwt mockGeneratedJwt = mock(Jwt.class);
        when(mockGeneratedJwt.getTokenValue()).thenReturn("generated-jwt-token");
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(mockGeneratedJwt);

        // Act
        String token = jwtService.generateToken(null); //TODO fix this

        // Assert
        assertNotNull(token);
        assertEquals("generated-jwt-token", token);
        
        verify(jwtEncoder).encode(any(JwtEncoderParameters.class));
    }

    @Test
    void extractUsername_ShouldReturnEmail_WhenValidTokenProvided() {
        // Arrange
        String token = "valid-jwt-token";
        when(mockJwt.getSubject()).thenReturn("test@example.com");
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        String extractedEmail = jwtService.extractUsername(token);

        // Assert
        assertEquals("test@example.com", extractedEmail);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void extractUsername_ShouldReturnEmail_WhenTokenHasBearerPrefix() {
        // Arrange
        String tokenWithBearer = "Bearer valid-jwt-token";
        String cleanToken = "valid-jwt-token";
        when(jwtDecoder.decode(cleanToken)).thenReturn(mockJwt);

        // Act
        String extractedEmail = jwtService.extractUsername(tokenWithBearer);

        // Assert
        assertEquals("test@example.com", extractedEmail);
        verify(jwtDecoder).decode(cleanToken);
    }

    @Test
    void extractRole_ShouldReturnRole_WhenValidTokenProvided() {
        // Arrange
        String token = "valid-jwt-token";
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        String extractedRole = jwtService.extractRole(token);

        // Assert
        assertEquals("CUSTOMER", extractedRole);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void extractRole_ShouldReturnRole_WhenTokenHasBearerPrefix() {
        // Arrange
        String tokenWithBearer = "Bearer valid-jwt-token";
        String cleanToken = "valid-jwt-token";
        when(jwtDecoder.decode(cleanToken)).thenReturn(mockJwt);

        // Act
        String extractedRole = jwtService.extractRole(tokenWithBearer);

        // Assert
        assertEquals("CUSTOMER", extractedRole);
        verify(jwtDecoder).decode(cleanToken);
    }

    @Test
    void isTokenValid_ShouldReturnTrue_WhenTokenIsNotExpired() {
        // Arrange
        String token = "valid-jwt-token";
        Instant futureExpiration = Instant.now().plus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(futureExpiration);
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        boolean isValid = jwtService.isTokenValid(token);

        // Assert
        assertTrue(isValid);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenTokenIsExpired() {
        // Arrange
        String token = "expired-jwt-token";
        Instant pastExpiration = Instant.now().minus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(pastExpiration);
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        boolean isValid = jwtService.isTokenValid(token);

        // Assert
        assertFalse(isValid);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenTokenDecodingThrowsException() {
        // Arrange
        String invalidToken = "invalid-jwt-token";
        when(jwtDecoder.decode(invalidToken)).thenThrow(new JwtException("Invalid token"));

        // Act
        boolean isValid = jwtService.isTokenValid(invalidToken);

        // Assert
        assertFalse(isValid);
        verify(jwtDecoder).decode(invalidToken);
    }

    @Test
    void isTokenValid_ShouldHandleBearerPrefix() {
        // Arrange
        String tokenWithBearer = "Bearer valid-jwt-token";
        String cleanToken = "valid-jwt-token";
        Instant futureExpiration = Instant.now().plus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(futureExpiration);
        when(jwtDecoder.decode(cleanToken)).thenReturn(mockJwt);

        // Act
        boolean isValid = jwtService.isTokenValid(tokenWithBearer);

        // Assert
        assertTrue(isValid);
        verify(jwtDecoder).decode(cleanToken);
    }

    @Test
    void isTokenExpired_ShouldReturnTrue_WhenTokenIsExpired() {
        // Arrange
        String token = "expired-jwt-token";
        Instant pastExpiration = Instant.now().minus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(pastExpiration);
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        boolean isExpired = jwtService.isTokenExpired(token);

        // Assert
        assertTrue(isExpired);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void isTokenExpired_ShouldReturnFalse_WhenTokenIsNotExpired() {
        // Arrange
        String token = "valid-jwt-token";
        Instant futureExpiration = Instant.now().plus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(futureExpiration);
        when(jwtDecoder.decode(token)).thenReturn(mockJwt);

        // Act
        boolean isExpired = jwtService.isTokenExpired(token);

        // Assert
        assertFalse(isExpired);
        verify(jwtDecoder).decode(token);
    }

    @Test
    void isTokenExpired_ShouldReturnTrue_WhenTokenDecodingThrowsException() {
        // Arrange
        String invalidToken = "invalid-jwt-token";
        when(jwtDecoder.decode(invalidToken)).thenThrow(new JwtException("Invalid token"));

        // Act
        boolean isExpired = jwtService.isTokenExpired(invalidToken);

        // Assert
        assertTrue(isExpired);
        verify(jwtDecoder).decode(invalidToken);
    }

    @Test
    void isTokenExpired_ShouldHandleBearerPrefix() {
        // Arrange
        String tokenWithBearer = "Bearer expired-jwt-token";
        String cleanToken = "expired-jwt-token";
        Instant pastExpiration = Instant.now().minus(1, ChronoUnit.HOURS);
        when(mockJwt.getExpiresAt()).thenReturn(pastExpiration);
        when(jwtDecoder.decode(cleanToken)).thenReturn(mockJwt);

        // Act
        boolean isExpired = jwtService.isTokenExpired(tokenWithBearer);

        // Assert
        assertTrue(isExpired);
        verify(jwtDecoder).decode(cleanToken);
    }
}