#!/bin/bash

# FreshTrio Backend Server Start Script
# This script starts the Java Spring Boot backend server

set -e

echo "🚀 Starting FreshTrio Backend Server..."

# Navigate to backend directory
cd backend

# Check if Maven is available
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not found. Please install Maven first."
    exit 1
fi

# Check if PostgreSQL is running (Docker)
if ! docker ps | grep -q freshtrio-db; then
    echo "🐳 Starting PostgreSQL database..."
    cd ..
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 10
    cd backend
fi

# Clean and start the application
echo "🧹 Cleaning previous build..."
mvn clean

echo "🚀 Starting Spring Boot application..."
echo "📊 Server will be available at: http://localhost:8080"
echo "🔍 Health check: http://localhost:8080/actuator/health"
echo "📱 API endpoints: http://localhost:8080/api/products"
echo ""
echo "Press Ctrl+C to stop the server"

# Start with JVM options for better development experience
MAVEN_OPTS="-Xmx1024m -Xms512m" \
mvn spring-boot:run \
    -Dspring-boot.run.jvmArguments="-Dserver.port=8080 -Dspring.profiles.active=development"