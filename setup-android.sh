#!/bin/bash

# FreshTrio Android Setup Script
# This script sets up Android development environment

set -e

echo "🤖 Setting up Android development environment for FreshTrio..."

# Navigate to mobile directory
cd mobile

# Generate Android project if it doesn't exist
if [ ! -d "android" ]; then
    echo "🔧 Generating Android project files..."
    npx expo prebuild --platform android --clean
fi

# Set Android environment variables
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}

echo "🔍 Checking Android development environment..."

# Check Android SDK
if [ -d "$ANDROID_HOME" ]; then
    echo "✅ Android SDK found at: $ANDROID_HOME"
else
    echo "❌ Android SDK not found!"
    echo "Please:"
    echo "1. Install Android Studio from https://developer.android.com/studio"
    echo "2. Set ANDROID_HOME environment variable"
    echo "3. Add to your ~/.zshrc or ~/.bashrc:"
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator:\$ANDROID_HOME/tools:\$ANDROID_HOME/tools/bin:\$ANDROID_HOME/platform-tools"
    exit 1
fi

# Check if adb is available
if command -v adb &> /dev/null; then
    echo "✅ ADB found: $(which adb)"
else
    echo "❌ ADB not found in PATH!"
    echo "Add Android SDK to PATH in your ~/.zshrc or ~/.bashrc"
    exit 1
fi

# Check available emulators
echo "📱 Available Android emulators:"
if emulator -list-avds 2>/dev/null | grep -q .; then
    emulator -list-avds
else
    echo "❌ No Android emulators found!"
    echo "Create an emulator in Android Studio:"
    echo "1. Open Android Studio"
    echo "2. Go to Tools > AVD Manager"
    echo "3. Create a new virtual device"
    echo "4. Choose API level 33 or higher"
fi

# Check if emulator is running
if adb devices | grep -q emulator; then
    echo "✅ Android emulator is running"
    adb devices
else
    echo "⚠️  No Android emulator running"
    echo "Start an emulator with:"
    echo "emulator -avd <emulator_name>"
fi

# Navigate to Android directory and check Gradle
cd android

# Check if gradlew is executable
if [ ! -x "./gradlew" ]; then
    chmod +x ./gradlew
fi

echo "🔨 Testing Gradle build..."
./gradlew --version

echo ""
echo "🎉 Android setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Start an Android emulator"
echo "2. Run: ./build-android.sh"

cd ../..