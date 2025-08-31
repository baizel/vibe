#!/bin/bash

# FreshTrio iOS Build Script
# This script builds the iOS app for simulator

set -e

echo "🚀 Starting iOS build for FreshTrio..."

# Navigate to mobile directory
cd mobile

# Check if iOS directory exists
if [ ! -d "ios" ]; then
    echo "📱 Generating iOS project files..."
    npx expo prebuild --platform ios --clean
fi

# Navigate to iOS directory and install pods
echo "📦 Installing CocoaPods dependencies..."
cd ios
pod install

# Build the app for simulator
echo "🔨 Building iOS app for iPhone 16 Simulator..."
xcodebuild \
    -workspace FreshTrio.xcworkspace \
    -scheme FreshTrio \
    -configuration Debug \
    -sdk iphonesimulator \
    -destination 'platform=iOS Simulator,name=iPhone 16' \
    -derivedDataPath build \
    ONLY_ACTIVE_ARCH=NO \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    | xcpretty || true

# Check if build was successful
if [ -d "build/Build/Products/Debug-iphonesimulator/FreshTrio.app" ]; then
    echo "✅ iOS build completed successfully!"
    echo "📱 App location: ios/build/Build/Products/Debug-iphonesimulator/FreshTrio.app"
    
    # Install to simulator
    echo "📲 Installing app to iOS Simulator..."
    xcrun simctl install booted "build/Build/Products/Debug-iphonesimulator/FreshTrio.app" || true
    
    echo "🚀 Launch app with: xcrun simctl launch booted org.name.FreshTrio"
else
    echo "❌ iOS build failed. Check the logs above for errors."
fi

cd ../..