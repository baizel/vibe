import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { authAPI } from "./api";
import { tokenService, UserData } from "./tokenService";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  deleteUser,
  onAuthStateChanged
} from "firebase/auth";

// Import from our centralized Firebase config
import { auth } from "../config/firebase";

// Only import GoogleSignin on mobile platforms
let GoogleSignin: any = null;
if (Platform.OS !== "web") {
  GoogleSignin =
    require("@react-native-google-signin/google-signin").GoogleSignin;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: string;
}

class FirebaseAuthService {
  constructor() {
    // Configure Google Sign-In only on mobile platforms
    if (Platform.OS !== "web" && GoogleSignin) {
      GoogleSignin.configure({
        webClientId:
          "597482260340-ur0gb874aspdemr6v7sl0u9u1iobjkol.apps.googleusercontent.com", // Web client ID from Firebase console
        offlineAccess: true,
      });
    }
  }

  // Get current user
  getCurrentUser(): any | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: any | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Convert Firebase user to AuthUser
  private formatUser(user: any): AuthUser {
    const providerData = user.providerData?.[0];
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      provider: providerData?.providerId || "password",
    };
  }

  // Convert AuthUser to UserData for token service
  private convertToUserData(authUser: AuthUser, backendUser?: any): UserData {
    return {
      id: backendUser?.id || authUser.uid,
      email: authUser.email || "",
      displayName: authUser.displayName || backendUser?.displayName || "",
      photoURL: authUser.photoURL || backendUser?.photoURL || "",
      role: backendUser?.role || "customer",
      provider: authUser.provider,
    };
  }

  // Authenticate with backend after Firebase auth
  private async authenticateWithBackend(
    firebaseUser: AuthUser
  ): Promise<UserData> {
    try {
      // Get Firebase ID token
      let idToken: string;

      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user");
      idToken = await user.getIdToken();

      // Send to backend for verification and JWT generation
      const response = await authAPI.firebaseAuth(
        idToken,
        firebaseUser.provider === "google.com" ? "google" : "firebase"
      );

      // Save tokens
      await tokenService.saveTokensWithExpiry(
        response.accessToken,
        response.refreshToken
      );

      // Convert to UserData and save
      const userData = this.convertToUserData(firebaseUser, response.user);
      await tokenService.saveUser(userData);

      return userData;
    } catch (error) {
      console.error("Backend authentication failed:", error);
      throw new Error("Failed to authenticate with server. Please try again.");
    }
  }

  // Email/Password Sign Up - returns UserData after backend authentication
  async signUpWithEmail(
    email: string,
    password: string,
    additionalData?: any
  ): Promise<UserData> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = this.formatUser(userCredential.user);

      // Authenticate with backend and save session
      const userData = await this.authenticateWithBackend(firebaseUser);

      return userData;
    } catch (error: any) {
      // If Firebase account was created but backend auth failed, we should clean up
      if (error.message?.includes("Failed to authenticate with server")) {
        try {
          await this.deleteAccount(); // Clean up Firebase account
        } catch (cleanupError) {
          console.error("Failed to cleanup Firebase account:", cleanupError);
        }
      }
      throw error;
    }
  }

  // Email/Password Sign In - returns UserData after backend authentication
  async signInWithEmail(email: string, password: string): Promise<UserData> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const firebaseUser = this.formatUser(userCredential.user);

      // Authenticate with backend and save session
      const userData = await this.authenticateWithBackend(firebaseUser);

      return userData;
    } catch (error) {
      throw error;
    }
  }

  // Google Sign-In - returns UserData after backend authentication
  async signInWithGoogle(): Promise<UserData> {
    if (Platform.OS === "web") {
      return this.signInWithGoogleWeb();
    }

    if (!GoogleSignin) {
      throw new Error("Google Sign-In is not configured properly.");
    }

    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Get the users ID token
      const { idToken } = await GoogleSignin.signIn();

      // Create a Google credential with the token and sign in using Firebase web SDK
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const userCredential = await signInWithCredential(auth, googleCredential);

      const firebaseUser = this.formatUser(userCredential.user);

      // Authenticate with backend and save session
      const userData = await this.authenticateWithBackend(firebaseUser);

      return userData;
    } catch (error) {
      throw error;
    }
  }

  // Google Sign-In for Web using Firebase Auth
  private async signInWithGoogleWeb(): Promise<UserData> {
    try {
      // Create Google Auth Provider
      const provider = new GoogleAuthProvider();

      // Add scopes if needed
      provider.addScope("profile");
      provider.addScope("email");

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, provider);

      const firebaseUser = this.formatUser(userCredential.user);

      // Authenticate with backend and save session
      const userData = await this.authenticateWithBackend(firebaseUser);

      return userData;
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      if (error.code === "auth/popup-blocked") {
        throw new Error(
          "Google Sign-In popup was blocked. Please allow popups and try again."
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Google Sign-In was cancelled.");
      } else {
        throw new Error("Failed to sign in with Google. Please try again.");
      }
    }
  }

  // Sign Out - Complete logout flow
  async signOut(): Promise<void> {
    try {
      // Notify backend of logout
      try {
        await authAPI.logout();
      } catch (error) {
        console.warn("Backend logout failed, continuing with local cleanup:", error);
      }

      // Sign out from Firebase
      await firebaseSignOut(auth);

      // Sign out from Google if signed in (mobile only)
      if (Platform.OS !== "web" && GoogleSignin) {
        const isGoogleSignedIn = await GoogleSignin.isSignedIn();
        if (isGoogleSignedIn) {
          await GoogleSignin.signOut();
        }
      }

      // Clear all authentication data
      await tokenService.clearAuth();
    } catch (error) {
      console.error('Sign-out error:', error);
      // Even if some logout steps fail, clear local data
      await tokenService.clearAuth();
      throw error;
    }
  }

  // Send Password Reset Email
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  // Check if email is verified
  async sendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, updates);
      }
    } catch (error) {
      throw error;
    }
  }

  // Delete user account
  async deleteAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
      }
    } catch (error) {
      throw error;
    }
  }
}

export const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
