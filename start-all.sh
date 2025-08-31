#!/bin/bash

# FreshTrio Full Stack Start Script
# This script starts the complete development environment

set -e

echo "🚀 Starting FreshTrio Full Stack Development Environment..."

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set trap for cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start PostgreSQL database
echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

echo "⏳ Waiting for database to be ready..."
sleep 10

# Start backend server in background
echo "☕ Starting backend server..."
./start-backend.sh &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if backend is running
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend server is running at http://localhost:8080"
else
    echo "⚠️  Backend server may still be starting. Check manually if needed."
fi

# Start mobile development server in background
echo "📱 Starting mobile development server..."
./start-mobile.sh &
MOBILE_PID=$!

echo ""
echo "🎉 FreshTrio development environment is starting up!"
echo ""
echo "🔗 Services:"
echo "   🐳 Database:  PostgreSQL on port 5432"
echo "   ☕ Backend:   http://localhost:8080"
echo "   📱 Mobile:    http://localhost:8081"
echo ""
echo "🛠️  Development commands:"
echo "   iOS Build:     ./build-ios.sh"
echo "   Android Build: ./build-android.sh"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait