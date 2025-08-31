#!/bin/bash

# FreshTrio Mobile Development Server Script
# This script starts the Expo development server for mobile app

set -e

echo "🚀 Starting FreshTrio Mobile Development Server..."

# Navigate to mobile directory
cd mobile

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing mobile dependencies..."
    npm install
fi

# Set environment variables for local backend connection
export EXPO_PUBLIC_API_URL=http://localhost:8080
export EXPO_PUBLIC_ENV=development

echo "🔧 Configuration:"
echo "   Backend API: $EXPO_PUBLIC_API_URL"
echo "   Environment: $EXPO_PUBLIC_ENV"
echo ""
echo "🌐 Web: http://localhost:8081"
echo "📱 Scan QR code with Expo Go app to run on physical device"
echo "💻 Press 'i' to run iOS simulator"
echo "🤖 Press 'a' to run Android emulator"
echo ""
echo "Press Ctrl+C to stop the development server"

# Start Expo development server with polyfill for backend connection
NODE_OPTIONS="--require=./node_polyfill.js" \
npx expo start \
    --port 8081 \
    --dev-client