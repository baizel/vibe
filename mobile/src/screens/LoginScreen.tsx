import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Divider,
  Snackbar,
  Banner,
  ActivityIndicator,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import firebaseAuth from '../services/firebaseAuth';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { isAuthenticated, user, isLoading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // Navigate away when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user && !authLoading && !loading) {
      console.log('User authenticated, returning to previous screen...', { user: user.email });
      
      // Small delay to ensure auth state is fully settled and UI feedback is visible
      const timer = setTimeout(() => {
        // Always go back to previous screen to maintain user's workflow
        if (navigation.canGoBack()) {
          console.log('Returning to previous screen...');
          navigation.goBack(); // Return to where user was before login
        } else {
          // Fallback: if somehow can't go back (direct access, deep link, etc.), 
          // go to home to start their shopping experience
          console.log('No previous screen found, redirecting to Home...');
          navigation.replace('CustomerTabs', { screen: 'Home' });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, authLoading, loading, navigation]);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const showBanner = (message: string) => {
    setBannerMessage(message);
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 5000);
  };

  const handleEmailAuth = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      showFeedback('Please enter both email and password', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showFeedback('Please enter a valid email address', 'error');
      return;
    }

    // Password validation for sign up
    if (isSignUp && password.length < 6) {
      showFeedback('Password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        showFeedback('Account created successfully! Returning to your previous screen...', 'success');
        showBanner('Welcome to YorkMart! Please check your email for verification.');
        await firebaseAuth.sendEmailVerification();
        console.log('User signed up and logged in successfully');
        
        // Navigation will be handled by useEffect when auth state updates
      } else {
        await signIn(email.trim(), password);
        showFeedback('Successfully signed in! Returning to your previous screen...', 'success');
        console.log('User signed in successfully');
        
        // Navigation will be handled by useEffect when auth state updates
      }
    } catch (error: any) {
      console.error('Email auth error:', error);
      
      // Handle specific Firebase auth errors
      let userFriendlyMessage = 'Authentication failed. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            userFriendlyMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            userFriendlyMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/user-not-found':
            userFriendlyMessage = 'No account found with this email address. Please sign up first.';
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'auth/too-many-requests':
            userFriendlyMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'auth/email-already-in-use':
            userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
            break;
          case 'auth/weak-password':
            userFriendlyMessage = 'Password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/operation-not-allowed':
            userFriendlyMessage = 'Email/password authentication is not enabled. Please contact support.';
            break;
          case 'auth/invalid-verification-code':
            userFriendlyMessage = 'Invalid verification code. Please try again.';
            break;
          case 'auth/invalid-verification-id':
            userFriendlyMessage = 'Invalid verification ID. Please try again.';
            break;
          default:
            userFriendlyMessage = error.message || 'Authentication failed. Please try again.';
        }
      } else if (error.message) {
        // Handle custom error messages from our backend
        if (error.message.includes('Failed to authenticate with server')) {
          userFriendlyMessage = 'Server authentication failed. Please try again.';
        } else if (error.message.includes('Firebase is not properly configured')) {
          userFriendlyMessage = 'Authentication service is temporarily unavailable. Please try again later.';
        } else {
          userFriendlyMessage = error.message;
        }
      }
      
      showFeedback(userFriendlyMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      showFeedback('Successfully signed in with Google! Returning to your previous screen...', 'success');
      console.log('Google sign-in successful');
      
      // Navigation will be handled by useEffect when auth state updates
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      // Handle specific Google Sign-In errors
      let userFriendlyMessage = 'Failed to sign in with Google. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/account-exists-with-different-credential':
            userFriendlyMessage = 'An account already exists with the same email but different sign-in method. Please try signing in with email/password.';
            break;
          case 'auth/credential-already-in-use':
            userFriendlyMessage = 'This Google account is already linked to another user account.';
            break;
          case 'auth/popup-blocked':
            userFriendlyMessage = 'Google Sign-In popup was blocked. Please allow popups and try again.';
            break;
          case 'auth/popup-closed-by-user':
            userFriendlyMessage = 'Google Sign-In was cancelled. Please try again.';
            break;
          case 'auth/unauthorized-domain':
            userFriendlyMessage = 'This domain is not authorized for Google Sign-In. Please contact support.';
            break;
          case 'auth/network-request-failed':
            userFriendlyMessage = 'Network error during Google Sign-In. Please check your connection and try again.';
            break;
          default:
            if (error.message) {
              if (error.message.includes('Google Sign-In script failed to load')) {
                userFriendlyMessage = 'Google Sign-In service is temporarily unavailable. Please try email sign-in instead.';
              } else if (error.message.includes('popup')) {
                userFriendlyMessage = 'Google Sign-In popup issue. Please try again or use email sign-in.';
              } else {
                userFriendlyMessage = error.message;
              }
            }
        }
      } else if (error.message) {
        // Handle custom error messages
        if (error.message.includes('Google Sign-In is not configured properly')) {
          userFriendlyMessage = 'Google Sign-In is temporarily unavailable. Please use email sign-in instead.';
        } else if (error.message.includes('Failed to authenticate with server')) {
          userFriendlyMessage = 'Google authentication succeeded but server login failed. Please try again.';
        } else {
          userFriendlyMessage = error.message;
        }
      }
      
      showFeedback(userFriendlyMessage, 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async () => {
    if (!email.trim()) {
      showFeedback('Please enter your email address first', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showFeedback('Please enter a valid email address', 'error');
      return;
    }

    try {
      await firebaseAuth.sendPasswordResetEmail(email.trim());
      showFeedback('Password reset email sent! Please check your inbox.', 'success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Handle specific password reset errors
      let userFriendlyMessage = 'Failed to send password reset email';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            userFriendlyMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
            userFriendlyMessage = 'No account found with this email address. Please check the email or sign up first.';
            break;
          case 'auth/too-many-requests':
            userFriendlyMessage = 'Too many password reset requests. Please try again later.';
            break;
          case 'auth/network-request-failed':
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
            break;
          default:
            userFriendlyMessage = error.message || 'Failed to send password reset email. Please try again.';
        }
      } else {
        userFriendlyMessage = error.message || 'Failed to send password reset email. Please try again.';
      }
      
      showFeedback(userFriendlyMessage, 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Title>
              <Paragraph style={styles.subtitle}>
                {isSignUp 
                  ? 'Sign up to get started with YorkMart' 
                  : 'Sign in to continue shopping'
                }
              </Paragraph>

              <View style={styles.form}>
                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={styles.input}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                <Button
                  mode="contained"
                  onPress={handleEmailAuth}
                  loading={loading}
                  disabled={loading}
                  style={styles.primaryButton}
                >
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Button>

                {!isSignUp && (
                  <Button
                    mode="text"
                    onPress={handleForgotPassword}
                    style={styles.forgotButton}
                  >
                    Forgot Password?
                  </Button>
                )}
              </View>

              <Divider style={styles.divider} />
              <Text style={styles.orText}>Or continue with</Text>

              <View style={styles.socialButtons}>
                <Button
                  mode="outlined"
                  icon="google"
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  style={styles.socialButton}
                >
                  Continue with Google
                </Button>
                {Platform.OS === 'web' && (
                  <div id="google-signin-button" style={{ display: 'none' }}></div>
                )}
              </View>

              <View style={styles.toggleContainer}>
                <Text>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <Button
                  mode="text"
                  onPress={() => setIsSignUp(!isSignUp)}
                  disabled={loading}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success/Error Banner */}
      <Banner
        visible={bannerVisible}
        actions={[
          {
            label: 'Dismiss',
            onPress: () => setBannerVisible(false),
          },
        ]}
        icon="information"
        style={styles.banner}
      >
        {bannerMessage}
      </Banner>

      {/* Snackbar for quick feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        style={[
          styles.snackbar,
          snackbarType === 'error' ? styles.errorSnackbar : styles.successSnackbar
        ]}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Loading Overlay */}
      {loading && (
        <Portal>
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>
                {isSignUp ? 'Creating your account...' : 'Signing you in...'}
              </Text>
            </View>
          </View>
        </Portal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  divider: {
    marginVertical: 24,
  },
  orText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  socialButtons: {
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    paddingVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webNote: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  webNoteText: {
    color: '#1976D2',
    fontSize: 14,
    textAlign: 'center',
  },
  banner: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  snackbar: {
    marginBottom: 16,
  },
  successSnackbar: {
    backgroundColor: '#4caf50',
  },
  errorSnackbar: {
    backgroundColor: '#f44336',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});