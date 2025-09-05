package com.freshtrio.config;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.io.File;

@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.project-id:fresh-c7323}")
    private String projectId;

    @Value("${app.firebase.client-email:}")
    private String clientEmail;

    @Value("${app.firebase.private-key:}")
    private String privateKey;

    @Value("${app.firebase.private-key-id:}")
    private String privateKeyId;

    @Value("${GOOGLE_APPLICATION_CREDENTIALS:}")
    private String googleApplicationCredentials;

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();

                // Try to use GOOGLE_APPLICATION_CREDENTIALS file (preferred metho
                try {
                    credentials = GoogleCredentials.getApplicationDefault();
                } catch (Exception e) {
                    System.err.println("Failed to load service account file: " + e.getMessage());
                }


                // Fallback to environment variables
                if (credentials == null && privateKey != null && !privateKey.isEmpty() &&
                        clientEmail != null && !clientEmail.isEmpty()) {
                    String serviceAccountJson = createServiceAccountJson();
                    ByteArrayInputStream serviceAccount = new ByteArrayInputStream(
                            serviceAccountJson.getBytes(StandardCharsets.UTF_8));
                    credentials = GoogleCredentials.fromStream(serviceAccount);
                    System.out.println("Firebase Admin SDK using environment variables for service account");
                }

                if (credentials != null) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .setProjectId(projectId)
                            .build();

                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase Admin SDK initialized successfully for project: " + projectId);
                } else {
                    // No service account credentials available
                    System.err.println("WARNING: Firebase Admin SDK not initialized. No service account credentials provided.");
                    System.err.println("REQUIRED FOR PRODUCTION: Set environment variable:");
                    System.err.println("- GOOGLE_APPLICATION_CREDENTIALS (path to service account JSON file)");
                    System.err.println("Alternative: Set environment variables:");
                    System.err.println("- FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PRIVATE_KEY_ID");
                    System.err.println("Firebase authentication endpoints will fail until credentials are configured.");
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to initialize Firebase Admin SDK: " + e.getMessage());
            System.out.println("Firebase authentication endpoints will return appropriate error messages.");
        }
    }

    private String createServiceAccountJson() {
        return String.format("""
                {
                  "type": "service_account",
                  "project_id": "%s",
                  "private_key_id": "%s",
                  "private_key": "%s",
                  "client_email": "%s",
                  "client_id": "",
                  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                  "token_uri": "https://oauth2.googleapis.com/token",
                  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
                }
                """, projectId, privateKeyId, privateKey.replace("\\n", "\n"), clientEmail);
    }
}