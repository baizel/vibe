package com.freshtrio.dto;

import jakarta.validation.constraints.NotBlank;

public class FirebaseAuthRequest {
    
    @NotBlank(message = "Firebase ID token is required")
    private String idToken;
    
    private String fcmToken;
    
    public FirebaseAuthRequest() {}
    
    public FirebaseAuthRequest(String idToken, String fcmToken) {
        this.idToken = idToken;
        this.fcmToken = fcmToken;
    }
    
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    
    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
}