# Google Sign-In with Firebase Setup Guide

This guide will help you set up Firebase Authentication with Google Sign-In for your React Native Expo app across all platforms.

## Platform Support

- **Web**: Google Identity Services (works immediately)
- **Mobile**: Native Google Sign-In (requires development builds)

## Important: Mobile Expo Go Limitation

⚠️ **Google Sign-In on mobile cannot work with Expo Go** because it requires native modules. You must create a **development build** using `expo-dev-client` for mobile platforms.

## Prerequisites

1. Firebase project created at https://console.firebase.google.com/
2. Google Developer Console project
3. EAS CLI installed: `npm install -g @expo/eas-cli`

## Step 1: Firebase Console Setup

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Follow the setup wizard

### 1.2 Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable the following sign-in providers:
   - Email/Password
   - Google

### 1.3 Configure Firebase for React Native
1. Click on the gear icon ⚙️ next to "Project Overview"
2. Go to "Project settings"
3. Scroll down to "Your apps" section
4. Add iOS app:
   - iOS bundle ID: `com.freshtrio.mobile`
   - Download `GoogleService-Info.plist`
5. Add Android app:
   - Android package name: `com.freshtrio.mobile`
   - Download `google-services.json`

### 1.4 Update Configuration Files
1. Move `GoogleService-Info.plist` to your mobile app root directory
2. Move `google-services.json` to your mobile app root directory
3. Update `src/config/firebase.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-ABCDEF123" // Optional
};
```

## Step 2: Google Sign-In Setup

### 2.1 Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project (same as Firebase project)
3. Go to "Credentials"
4. Create OAuth 2.0 Client IDs for:
   - **Web application** (for web platform)
   - **iOS** (for mobile iOS, if building for iOS)
   - **Android** (for mobile Android, if building for Android)

### 2.2 Web Client ID Configuration
1. For the **Web application** client:
   - Add `http://localhost:8083` to "Authorized JavaScript origins" (for development)
   - Add your production web domain when deploying
2. Copy the **Web client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

### 2.3 Update Configuration Files

#### For Web Google Sign-In:
In `src/services/firebaseAuth.ts`, replace `YOUR_GOOGLE_CLIENT_ID`:
```typescript
const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Web client ID
```

#### For Mobile Google Sign-In:
1. In `src/services/firebaseAuth.ts`, replace `YOUR_WEB_CLIENT_ID` with your Web client ID
2. In `app.json`, replace `YOUR_IOS_CLIENT_ID` with your iOS client ID:

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_ACTUAL_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}
```

## Step 3: Development Build Setup

### 3.1 Install EAS CLI and Login
```bash
npm install -g @expo/eas-cli
eas login
```

### 3.2 Configure EAS Build
```bash
eas build:configure
```

This creates an `eas.json` file with build configurations.

## Step 4: Testing and Development

### 4.1 Web Development
```bash
# Start web development server
npx expo start --web
```

**Features on Web:**
- ✅ Email/Password authentication
- ✅ Google Sign-In (when configured)
- ✅ Password reset
- ✅ Works immediately, no build required

### 4.2 Mobile Development Build

```bash
# Build for iOS (simulator)
eas build --profile development --platform ios

# Build for Android 
eas build --profile development --platform android

# Or build for both platforms
eas build --profile development --platform all
```

#### Install Development Build
1. Download the build from the EAS dashboard
2. Install on your physical device or simulator
3. The development build includes the Expo dev tools launcher

#### Run Development Server
```bash
npx expo start --dev-client
```

### 4.3 Testing Authentication
**Web Platform:**
1. Open `http://localhost:8083` in your browser
2. Test email/password sign-up and sign-in
3. Test Google Sign-In (requires configuration)

**Mobile Platform:**
1. Open your development build on the device
2. Connect to your development server
3. Test authentication methods:
   - Email/Password registration and login
   - Google Sign-In (when configured)

## Step 5: Local Development (Alternative)

If you prefer to build locally instead of using EAS:

```bash
# Generate native code
npx expo prebuild --clean

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Step 6: Production Setup

### 6.1 Google Play Store
1. Upload your app's SHA-1 certificate fingerprint to Firebase
2. Configure OAuth consent screen in Google Cloud Console

### 6.2 iOS App Store
1. Configure proper signing certificates
2. Upload your app bundle ID to Firebase project

## Troubleshooting

### Common Issues

1. **Google Sign-In not working**: Check that you're using the correct Web client ID
2. **"Expo Go not supported" error**: This is expected - use development build instead
3. **Firebase connection issues**: Ensure your `google-services.json` and `GoogleService-Info.plist` files are correctly placed
4. **Development build not launching**: Make sure you're using `npx expo start --dev-client`

### Debug Tips

1. Check the console logs for detailed error messages
2. Ensure all required permissions are granted
3. Test on physical devices for Google authentication
4. Verify your Firebase Authentication rules allow the sign-in methods
5. Use `npx expo start --dev-client --clear` to clear cache if needed

## Security Notes

1. Never commit your Firebase configuration with real credentials to version control
2. Use environment variables for sensitive configuration in production
3. Configure Firebase Security Rules appropriately
4. Enable App Check for additional security in production

## Development Workflow

With development builds, your workflow becomes:

1. **Code Changes**: Make changes to your JavaScript code
2. **Hot Reload**: Changes appear instantly (like Expo Go)
3. **Native Changes**: If you modify native code or add new native libraries:
   - Run `npx expo prebuild --clean`
   - Rebuild with `eas build` or local build commands

## Next Steps

After completing this setup:
1. Test Google Sign-In authentication flow
2. Implement proper error handling
3. Add email verification flow
4. Set up user profile management
5. Configure Firebase Security Rules
6. Add logout functionality to your app's UI

## Useful Commands Reference

```bash
# Development build
eas build --profile development --platform all

# Start development server
npx expo start --dev-client

# Local builds (alternative to EAS)
npx expo prebuild --clean
npx expo run:ios
npx expo run:android

# Clear cache if needed
npx expo start --dev-client --clear
```

For more detailed information, refer to:
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Google Sign-In for React Native](https://react-native-google-signin.github.io/docs/)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [React Native Firebase Documentation](https://rnfirebase.io/)