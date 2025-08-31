#!/bin/bash

# FreshTrio Android Build Script
# This script builds the Android app for emulator

set -e

echo "🚀 Starting Android build for FreshTrio..."

# Navigate to mobile directory
cd mobile

# Check if Android directory exists
if [ ! -d "android" ]; then
    echo "🤖 Generating Android project files..."
    npx expo prebuild --platform android --clean
fi

# Set Android environment variables
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Library/Android/sdk}
export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ]; then
    echo "⚠️  Android SDK not found at $ANDROID_HOME"
    echo "Please install Android Studio and set ANDROID_HOME environment variable"
    exit 1
fi

# Navigate to Android directory
cd android

echo "🔨 Building Android APK for debug..."
./gradlew assembleDebug \
    -PRNG_DISABLE_FLIPPER=1 \
    -PRNG_DISABLE_HERMES=0 \
    --no-daemon \
    --stacktrace

# Check if build was successful
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Android build completed successfully!"
    echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Check if emulator is running
    if adb devices | grep -q "emulator"; then
        echo "📲 Installing APK to Android Emulator..."
        adb install -r app/build/outputs/apk/debug/app-debug.apk
        echo "🚀 Starting app on emulator..."
        adb shell am start -n com.freshtrio.mobile/.MainActivity
    else
        echo "⚠️  No Android emulator detected. Start an emulator first, then run:"
        echo "adb install -r android/app/build/outputs/apk/debug/app-debug.apk"
    fi
else
    echo "❌ Android build failed. Check the logs above for errors."
fi

cd ../..