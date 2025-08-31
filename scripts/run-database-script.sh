#!/bin/bash

# Database connection configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-freshtrio}"
DB_USER="${DB_USERNAME:-freshtrio_user}"
DB_PASSWORD="${DB_PASSWORD:-password}"

# Function to execute SQL script
execute_sql() {
    local script_file=$1
    local description=$2
    
    echo "Executing: $description"
    echo "Script: $script_file"
    
    if [ ! -f "$script_file" ]; then
        echo "Error: Script file '$script_file' not found!"
        exit 1
    fi
    
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$script_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully executed: $description"
    else
        echo "❌ Failed to execute: $description"
        exit 1
    fi
    echo ""
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [init|clear|help]"
    echo ""
    echo "Commands:"
    echo "  init   - Initialize database with mock data"
    echo "  clear  - Clear all data from database (WARNING: Destructive!)"
    echo "  help   - Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST      - Database host (default: localhost)"
    echo "  DB_PORT      - Database port (default: 5432)"
    echo "  DB_NAME      - Database name (default: freshtrio)"
    echo "  DB_USERNAME  - Database username (default: freshtrio_user)"
    echo "  DB_PASSWORD  - Database password (default: password)"
    echo ""
    echo "Examples:"
    echo "  $0 init                    # Initialize with default settings"
    echo "  DB_HOST=mydb $0 init       # Initialize with custom host"
    echo "  $0 clear                   # Clear all data"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Main execution
case "${1:-help}" in
    init)
        echo "🚀 Initializing database with mock data..."
        echo "Connecting to: $DB_HOST:$DB_PORT/$DB_NAME as $DB_USER"
        echo ""
        execute_sql "$SCRIPT_DIR/init-database.sql" "Initialize database with mock data"
        echo "🎉 Database initialization completed!"
        ;;
    clear)
        echo "⚠️  WARNING: This will delete ALL data from the database!"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🧹 Clearing database..."
            execute_sql "$SCRIPT_DIR/clear-database.sql" "Clear all database data"
            echo "✨ Database cleared successfully!"
        else
            echo "Operation cancelled."
        fi
        ;;
    help|*)
        show_usage
        ;;
esac