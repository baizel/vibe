# FreshTrio - Fresh Meat Delivery Platform

A complete full-stack solution for fresh meat delivery with React Native mobile apps and Spring Boot backend.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for React Native development)
- Android Studio / Xcode (for mobile development)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd freshtrio
cp .env.example .env
# Edit .env with your configuration
```

### 2. Deploy to VPS

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### 3. Setup Mobile Development

```bash
cd mobile
npm install
npx expo start
```

## 📱 Mobile App Features

- ✅ Cross-platform (iOS, Android, Web)
- ✅ User authentication & registration
- ✅ Product catalog with search & filters
- ✅ Shopping cart & checkout
- ✅ Order tracking with real-time updates
- ✅ Push notifications
- ✅ Dual mode (Customer & Driver apps)

## 🔧 Backend Features

- ✅ Spring Boot 3 REST API
- ✅ PostgreSQL database
- ✅ JWT authentication
- ✅ Firebase push notifications
- ✅ File upload handling
- ✅ GDPR compliance
- ✅ Docker containerized

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │   Spring Boot   │    │   PostgreSQL    │
│   Mobile Apps   │◄──►│      API        │◄──►│    Database     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────▼───────┐
                       │     Nginx     │
                       │ Load Balancer │
                       └───────────────┘
```

## 🔒 Security Features

- JWT token authentication
- Rate limiting
- HTTPS encryption
- CORS configuration
- Input validation
- SQL injection prevention

## 📊 Monitoring & Maintenance

```bash
# View logs
docker-compose logs -f

# Backup database
./scripts/backup.sh

# Restore database
./scripts/restore.sh backup_file.sql.gz

# Update application
git pull
./scripts/deploy.sh
```

## 💰 Cost Estimate (50 users)

- VPS: $30-50/month
- Domain: $15/year
- Firebase: Free tier
- **Total: ~$35-55/month**

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Loyalty program
- [ ] Customer support chat

## 📞 Support

For issues and questions, check the logs:

```bash
docker-compose logs backend
docker-compose logs nginx
```
