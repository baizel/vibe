# FreshTrio Build & Development Scripts

This directory contains automated scripts to build and run the FreshTrio application across different platforms.

## 🚀 Quick Start

### Start Everything
```bash
./start-all.sh
```
This will start the PostgreSQL database, backend server, and mobile development server all at once.

## 📱 Mobile Development

### Development Server
```bash
./start-mobile.sh
```
- Starts Expo development server on port 8081
- Enables live reloading and debugging
- Supports iOS simulator, Android emulator, and physical devices

### iOS Build
```bash
./build-ios.sh
```
- Generates iOS project files if needed
- Installs CocoaPods dependencies
- Builds for iPhone 16 Simulator
- Automatically installs to running simulator

### Android Build
```bash
./build-android.sh
```
- Generates Android project files if needed
- Builds APK for debug configuration
- Installs to running Android emulator

### Android Setup
```bash
./setup-android.sh
```
- Verifies Android development environment
- Checks Android SDK and emulators
- Provides setup instructions if needed

## ☕ Backend Development

### Start Backend Server
```bash
./start-backend.sh
```
- Starts PostgreSQL database via Docker
- Launches Spring Boot application
- Available at http://localhost:8080

## 🔧 Configuration

### Environment Variables
The mobile app connects to the backend using these variables:
- `EXPO_PUBLIC_API_URL=http://localhost:8080`
- `EXPO_PUBLIC_ENV=development`

### Port Configuration
- **Backend**: 8080
- **Mobile Dev Server**: 8081
- **PostgreSQL**: 5432

## 📋 Prerequisites

### iOS Development
- macOS with Xcode installed
- Xcode Command Line Tools
- CocoaPods (`gem install cocoapods`)

### Android Development
- Android Studio
- Android SDK (API level 33+)
- Android emulator or physical device

### Backend Development
- Java 17+
- Maven 3.6+
- Docker & Docker Compose

### Mobile Development
- Node.js 18.18+
- npm or yarn
- Expo CLI

## 🏗️ Build Outputs

### iOS
- App bundle: `mobile/ios/build/Build/Products/Debug-iphonesimulator/FreshTrio.app`
- Automatically installs to iOS Simulator

### Android
- APK file: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`
- Automatically installs to Android emulator

## 🐛 Troubleshooting

### iOS Build Issues
- Ensure Xcode is properly installed
- Run `pod install` in `mobile/ios/` directory
- Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### Android Build Issues
- Verify Android SDK path: `echo $ANDROID_HOME`
- Start an Android emulator first
- Clear Gradle cache: `./gradlew clean`

### Backend Issues
- Check database connection: `docker-compose ps`
- Verify port availability: `lsof -i :8080`
- Check logs in console output

### Mobile Development Issues
- Clear Metro cache: `npx expo r -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Reset Expo cache: `npx expo install --fix`

## 📖 Development Workflow

1. **Initial Setup**:
   ```bash
   # Setup Android environment (first time only)
   ./setup-android.sh
   
   # Install dependencies
   cd mobile && npm install && cd ..
   ```

2. **Daily Development**:
   ```bash
   # Start all services
   ./start-all.sh
   ```

3. **Building for Testing**:
   ```bash
   # Build iOS
   ./build-ios.sh
   
   # Build Android
   ./build-android.sh
   ```

4. **Mobile-only Development**:
   ```bash
   # Start only mobile dev server
   ./start-mobile.sh
   ```

## 🔗 API Integration

The mobile app connects to the backend at `http://localhost:8080` with these endpoints:
- Health check: `/actuator/health`
- Products API: `/api/products`
- Authentication will be added as needed

## 📊 Monitoring

### Backend Health
- Health endpoint: http://localhost:8080/actuator/health
- Should return `{"status":"UP"}`

### Database Connection
- PostgreSQL runs in Docker container `freshtrio-db`
- Check with: `docker-compose ps postgres`

### Mobile Development
- Expo DevTools: http://localhost:8081
- Network tab shows API calls to backend

---

## 🎯 Next Steps

1. Test iOS build: `./build-ios.sh`
2. Set up Android environment: `./setup-android.sh`
3. Test Android build: `./build-android.sh`
4. Start full development environment: `./start-all.sh`