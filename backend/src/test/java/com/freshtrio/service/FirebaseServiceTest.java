package com.freshtrio.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FirebaseServiceTest {

    @Mock
    private FirebaseAuth firebaseAuth;

    @Mock
    private FirebaseToken firebaseToken;

    @InjectMocks
    private FirebaseService firebaseService;

    private static final String TEST_ID_TOKEN = "test-id-token";
    private static final String TEST_UID = "test-uid-123";
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_NAME = "Test User";
    private static final String TEST_PHONE = "+1234567890";

    @BeforeEach
    void setUp() {
        // Setup common mock responses
        when(firebaseToken.getUid()).thenReturn(TEST_UID);
        when(firebaseToken.getEmail()).thenReturn(TEST_EMAIL);
        when(firebaseToken.getName()).thenReturn(TEST_NAME);
    }

    @Test
    void verifyIdToken_ShouldReturnFirebaseToken_WhenValidToken() throws FirebaseAuthException {
        // Arrange
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);

            // Act
            FirebaseToken result = firebaseService.verifyIdToken(TEST_ID_TOKEN);

            // Assert
            assertNotNull(result);
            assertEquals(firebaseToken, result);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
        }
    }

    @Test
    void verifyIdToken_ShouldThrowFirebaseAuthException_WhenInvalidToken() throws FirebaseAuthException {
        // Arrange
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            FirebaseAuthException exception = mock(FirebaseAuthException.class);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenThrow(exception);

            // Act & Assert
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.verifyIdToken(TEST_ID_TOKEN));
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
        }
    }

    @Test
    void getUidFromToken_ShouldReturnUid_WhenValidToken() throws FirebaseAuthException {
        // Arrange
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);

            // Act
            String uid = firebaseService.getUidFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals(TEST_UID, uid);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getUid();
        }
    }

    @Test
    void getEmailFromToken_ShouldReturnEmail_WhenValidToken() throws FirebaseAuthException {
        // Arrange
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);

            // Act
            String email = firebaseService.getEmailFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals(TEST_EMAIL, email);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getEmail();
        }
    }

    @Test
    void getNameFromToken_ShouldReturnName_WhenValidToken() throws FirebaseAuthException {
        // Arrange
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);

            // Act
            String name = firebaseService.getNameFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals(TEST_NAME, name);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getName();
        }
    }

    @Test
    void getPhoneFromToken_ShouldReturnPhone_WhenValidToken() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> claims = new HashMap<>();
        claims.put("phone_number", TEST_PHONE);
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String phone = firebaseService.getPhoneFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals(TEST_PHONE, phone);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getPhoneFromToken_ShouldReturnNull_WhenNoPhoneInClaims() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> claims = new HashMap<>(); // No phone_number claim
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String phone = firebaseService.getPhoneFromToken(TEST_ID_TOKEN);

            // Assert
            assertNull(phone);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getProviderFromToken_ShouldReturnGoogleProvider_WhenGoogleAuth() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> identities = new HashMap<>();
        identities.put("google.com", "some_value");
        
        Map<String, Object> firebase = new HashMap<>();
        firebase.put("identities", identities);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("firebase", firebase);
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String provider = firebaseService.getProviderFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals("google.com", provider);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getProviderFromToken_ShouldReturnFacebookProvider_WhenFacebookAuth() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> identities = new HashMap<>();
        identities.put("facebook.com", "some_value");
        
        Map<String, Object> firebase = new HashMap<>();
        firebase.put("identities", identities);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("firebase", firebase);
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String provider = firebaseService.getProviderFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals("facebook.com", provider);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getProviderFromToken_ShouldReturnEmail_WhenNoProviderFound() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> claims = new HashMap<>(); // No firebase claim
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String provider = firebaseService.getProviderFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals("email", provider);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getProviderFromToken_ShouldReturnEmail_WhenMalformedFirebaseClaim() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> claims = new HashMap<>();
        claims.put("firebase", "malformed_firebase_claim"); // Not a Map
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String provider = firebaseService.getProviderFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals("email", provider);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void getProviderFromToken_ShouldReturnEmail_WhenEmptyIdentities() throws FirebaseAuthException {
        // Arrange
        Map<String, Object> identities = new HashMap<>(); // Empty identities
        
        Map<String, Object> firebase = new HashMap<>();
        firebase.put("identities", identities);
        
        Map<String, Object> claims = new HashMap<>();
        claims.put("firebase", firebase);
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenReturn(firebaseToken);
            when(firebaseToken.getClaims()).thenReturn(claims);

            // Act
            String provider = firebaseService.getProviderFromToken(TEST_ID_TOKEN);

            // Assert
            assertEquals("email", provider);
            verify(firebaseAuth).verifyIdToken(TEST_ID_TOKEN);
            verify(firebaseToken).getClaims();
        }
    }

    @Test
    void allMethods_ShouldThrowFirebaseAuthException_WhenTokenVerificationFails() throws FirebaseAuthException {
        // Arrange
        FirebaseAuthException authException = mock(FirebaseAuthException.class);
        
        try (MockedStatic<FirebaseAuth> mockFirebaseAuth = mockStatic(FirebaseAuth.class)) {
            mockFirebaseAuth.when(FirebaseAuth::getInstance).thenReturn(firebaseAuth);
            when(firebaseAuth.verifyIdToken(TEST_ID_TOKEN)).thenThrow(authException);

            // Act & Assert
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.getUidFromToken(TEST_ID_TOKEN));
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.getEmailFromToken(TEST_ID_TOKEN));
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.getNameFromToken(TEST_ID_TOKEN));
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.getPhoneFromToken(TEST_ID_TOKEN));
            assertThrows(FirebaseAuthException.class, 
                () -> firebaseService.getProviderFromToken(TEST_ID_TOKEN));
        }
    }
}