
# scripts/restore.sh - Database Restore Script
#!/bin/bash

# FreshTrio Database Restore Script
set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/freshtrio_backup_*.sql.gz
    exit 1
fi

BACKUP_FILE=$1

echo "⚠️  WARNING: This will replace all data in the database!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "📥 Restoring database from $BACKUP_FILE..."

# Stop the backend to prevent connections
docker-compose stop backend

# Extract and restore the backup
gunzip -c "$BACKUP_FILE" | docker-compose exec -T postgres psql -U freshtrio_user -d freshtrio

# Start the backend again
docker-compose start backend

echo "✅ Database restored successfully!"