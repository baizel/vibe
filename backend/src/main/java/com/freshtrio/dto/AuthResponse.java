// src/main/java/com/freshtrio/dto/AuthResponse.java
package com.freshtrio.dto;

public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;
    
    public AuthResponse(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.refreshToken = null; // For now, we're not implementing refresh tokens
        this.user = user;
    }
    
    public AuthResponse(String accessToken, String refreshToken, UserDto user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
    
    // Getters and Setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
    
    // Keep legacy token getter for backward compatibility
    public String getToken() { return accessToken; }
    public void setToken(String token) { this.accessToken = token; }
}