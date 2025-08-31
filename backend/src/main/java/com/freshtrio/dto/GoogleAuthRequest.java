package com.freshtrio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {
    
    @NotBlank(message = "Google ID token is required")
    private String idToken;
    
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;
    
    private String firstName;
    private String lastName;
    private String pictureUrl;
    
    public GoogleAuthRequest() {}
    
    public GoogleAuthRequest(String idToken, String email, String firstName, String lastName, String pictureUrl) {
        this.idToken = idToken;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.pictureUrl = pictureUrl;
    }
    
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getPictureUrl() { return pictureUrl; }
    public void setPictureUrl(String pictureUrl) { this.pictureUrl = pictureUrl; }
}