# scripts/deploy.sh - Deployment Script
#!/bin/bash

# FreshTrio Deployment Script
set -e

echo "🚀 Starting FreshTrio deployment..."

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

# Check if domain is set
if [ -z "$DOMAIN" ]; then
    echo "❌ DOMAIN not set in .env file"
    exit 1
fi

# Build Spring Boot application
echo "📦 Building Spring Boot application..."
cd backend
./mvnw clean package -DskipTests
cd ..

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start new containers
echo "🔨 Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose exec -T backend java -jar app.jar --spring.flyway.migrate

# Setup SSL certificate (first time only)
if [ ! -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "🔒 Setting up SSL certificate for $DOMAIN..."
    docker-compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email admin@$DOMAIN \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    # Reload nginx with SSL
    docker-compose exec nginx nginx -s reload
fi

# Health check
echo "🏥 Running health check..."
sleep 10
if curl -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Your FreshTrio API is now running at: https://$DOMAIN"
echo "🔍 Health check: https://$DOMAIN/health"

# Show running containers
echo "📊 Running containers:"
docker-compose ps