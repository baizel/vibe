# scripts/backup.sh - Database Backup Script
#!/bin/bash

# FreshTrio Database Backup Script
set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="freshtrio_backup_$DATE.sql"

echo "📊 Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec -T postgres pg_dump -U freshtrio_user freshtrio > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "freshtrio_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"