package com.freshtrio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.freshtrio.dto.FirebaseAuthRequest;
import com.freshtrio.dto.RegisterRequest;
import com.freshtrio.entity.User;
import com.freshtrio.repository.UserRepository;
import com.freshtrio.service.FirebaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "jwt.secret=testSecretKeyThatIsAtLeast32CharactersLongForTesting123456789"
})
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private FirebaseService firebaseService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        
        objectMapper = new ObjectMapper();
        
        // Clear database before each test
        userRepository.deleteAll();
    }

    @Test
    void register_ShouldCreateUserAndReturnToken_WhenValidRequest() throws Exception {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("1234567890");
        request.setGdprConsent(true);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user").exists())
                .andExpect(jsonPath("$.user.email").value("test@example.com"))
                .andExpect(jsonPath("$.user.displayName").value("John Doe"))
                .andExpect(jsonPath("$.user.role").value("customer"));

        // Verify user was created in database
        var users = userRepository.findAll();
        assertEquals(1, users.size());
        assertEquals("test@example.com", users.get(0).getEmail());
    }

    @Test
    void register_ShouldReturnConflict_WhenEmailAlreadyExists() throws Exception {
        // Arrange - Create existing user
        User existingUser = new User();
        existingUser.setEmail("existing@example.com");
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setRole(User.Role.CUSTOMER);
        existingUser.setIsVerified(true);
        existingUser.setGdprConsent(true);
        userRepository.save(existingUser);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setPhone("1234567890");
        request.setGdprConsent(true);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void firebaseAuth_ShouldCreateUserAndReturnToken_WhenValidFirebaseToken() throws Exception {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("valid-firebase-token");

        // Mock Firebase service responses
        when(firebaseService.getUidFromToken("valid-firebase-token")).thenReturn("firebase-uid-123");
        when(firebaseService.getEmailFromToken("valid-firebase-token")).thenReturn("firebase@example.com");
        when(firebaseService.getNameFromToken("valid-firebase-token")).thenReturn("Firebase User");
        when(firebaseService.getPhoneFromToken("valid-firebase-token")).thenReturn(null);
        when(firebaseService.getProviderFromToken("valid-firebase-token")).thenReturn("google.com");

        // Act & Assert
        mockMvc.perform(post("/api/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.user").exists())
                .andExpect(jsonPath("$.user.email").value("firebase@example.com"))
                .andExpect(jsonPath("$.user.displayName").value("Firebase User"))
                .andExpect(jsonPath("$.user.role").value("customer"));

        // Verify user was created in database
        var users = userRepository.findAll();
        assertEquals(1, users.size());
        assertEquals("firebase@example.com", users.get(0).getEmail());
        assertEquals(User.AuthProvider.GOOGLE, users.get(0).getAuthProvider());

        // Verify Firebase service was called
        verify(firebaseService).getUidFromToken("valid-firebase-token");
        verify(firebaseService).getEmailFromToken("valid-firebase-token");
        verify(firebaseService).getNameFromToken("valid-firebase-token");
        verify(firebaseService).getProviderFromToken("valid-firebase-token");
    }

    @Test
    void firebaseAuth_ShouldReturnError_WhenFirebaseTokenInvalid() throws Exception {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("invalid-firebase-token");

        // Mock Firebase service to throw exception
        when(firebaseService.getUidFromToken("invalid-firebase-token"))
                .thenThrow(new RuntimeException("Firebase token verification failed"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError());

        // Verify no user was created
        var users = userRepository.findAll();
        assertEquals(0, users.size());
    }

    @Test
    void firebaseAuth_ShouldUpdateExistingUser_WhenEmailExists() throws Exception {
        // Arrange - Create existing user without Firebase UID
        User existingUser = new User();
        existingUser.setEmail("existing@example.com");
        existingUser.setFirstName("Existing");
        existingUser.setLastName("User");
        existingUser.setRole(User.Role.CUSTOMER);
        existingUser.setIsVerified(true);
        existingUser.setGdprConsent(true);
        existingUser.setAuthProvider(User.AuthProvider.EMAIL);
        userRepository.save(existingUser);

        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("valid-firebase-token");

        // Mock Firebase service responses
        when(firebaseService.getUidFromToken("valid-firebase-token")).thenReturn("firebase-uid-123");
        when(firebaseService.getEmailFromToken("valid-firebase-token")).thenReturn("existing@example.com");
        when(firebaseService.getNameFromToken("valid-firebase-token")).thenReturn("Existing User");
        when(firebaseService.getPhoneFromToken("valid-firebase-token")).thenReturn(null);
        when(firebaseService.getProviderFromToken("valid-firebase-token")).thenReturn("google.com");

        // Act & Assert
        mockMvc.perform(post("/api/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.email").value("existing@example.com"));

        // Verify user was updated (still only one user in database)
        var users = userRepository.findAll();
        assertEquals(1, users.size());
        assertEquals("firebase-uid-123", users.get(0).getGoogleId());
    }

    @Test
    void logout_ShouldReturnOk_WhenCalled() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void logout_ShouldReturnOk_WhenCalledWithAuthenticatedUser() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer mock-token"))
                .andExpect(status().isOk());
    }

    @Test
    void register_ShouldReturnBadRequest_WhenInvalidRequestBody() throws Exception {
        // Arrange - Missing required fields
        RegisterRequest request = new RegisterRequest();
        request.setEmail("invalid-email"); // Invalid email format

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void firebaseAuth_ShouldReturnBadRequest_WhenMissingIdToken() throws Exception {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        // No idToken set

        // Act & Assert
        mockMvc.perform(post("/api/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void firebaseAuth_ShouldHandleProviderMapping_WhenDifferentProviders() throws Exception {
        // Arrange
        FirebaseAuthRequest request = new FirebaseAuthRequest();
        request.setIdToken("valid-firebase-token");

        // Mock Firebase service responses for different provider
        when(firebaseService.getUidFromToken("valid-firebase-token")).thenReturn("firebase-uid-123");
        when(firebaseService.getEmailFromToken("valid-firebase-token")).thenReturn("facebook@example.com");
        when(firebaseService.getNameFromToken("valid-firebase-token")).thenReturn("Facebook User");
        when(firebaseService.getPhoneFromToken("valid-firebase-token")).thenReturn(null);
        when(firebaseService.getProviderFromToken("valid-firebase-token")).thenReturn("facebook.com");

        // Act & Assert
        mockMvc.perform(post("/api/auth/firebase")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("facebook@example.com"));

        // Verify user was created with correct provider
        var users = userRepository.findAll();
        assertEquals(1, users.size());
        assertEquals(User.AuthProvider.FACEBOOK, users.get(0).getAuthProvider());
    }
}