package com.freshtrio.service;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.stereotype.Service;

@Service
public class FirebaseService {
    
    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        try {
            // Ensure Firebase is initialized
            if (FirebaseApp.getApps().isEmpty()) {
                throw new RuntimeException("Firebase Admin SDK is not properly initialized. Please configure service account credentials.");
            }
            
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (FirebaseAuthException e) {
            System.err.println("Failed to verify Firebase ID token: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.err.println("Failed to verify Firebase ID token: " + e.getMessage());
            throw new RuntimeException("Unable to verify Firebase token: " + e.getMessage(), e);
        }
    }
    
    public String getUidFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        return decodedToken.getUid();
    }
    
    public String getEmailFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        return decodedToken.getEmail();
    }
    
    public String getNameFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        return decodedToken.getName();
    }
    
    public String getPhoneFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        return (String) decodedToken.getClaims().get("phone_number");
    }
    
    public String getProviderFromToken(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = verifyIdToken(idToken);
        Object firebaseObj = decodedToken.getClaims().get("firebase");
        if (firebaseObj instanceof java.util.Map) {
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> firebase = (java.util.Map<String, Object>) firebaseObj;
            Object identitiesObj = firebase.get("identities");
            if (identitiesObj instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> identities = (java.util.Map<String, Object>) identitiesObj;
                // Return the first provider found
                for (String provider : identities.keySet()) {
                    return provider;
                }
            }
        }
        return "email"; // Default fallback
    }
}