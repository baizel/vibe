# Database Scripts

This directory contains scripts for managing the FreshTrio database.

## Prerequisites

- PostgreSQL client (`psql`) installed
- Database server running (either locally or via Docker)
- Proper environment variables or default credentials

## Available Scripts

### 1. Initialize Database with Mock Data
```bash
./run-database-script.sh init
```
Adds sample products and users to the database.

### 2. Clear All Database Data
```bash
./run-database-script.sh clear
```
⚠️ **WARNING**: This will delete ALL data from all tables!

### 3. Custom SQL Scripts
- `init-database.sql` - Contains INSERT statements for sample data
- `clear-database.sql` - Contains DELETE statements to clear all data

## Environment Variables

You can customize database connection settings:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=freshtrio
export DB_USERNAME=freshtrio_user
export DB_PASSWORD=password
```

## Quick Start with Docker

1. Start the database:
```bash
cd /path/to/fresh-trio
docker-compose up -d postgres
```

2. Wait for database to be ready, then initialize:
```bash
cd scripts
./run-database-script.sh init
```

## Manual Script Execution

If you prefer to run scripts manually:

```bash
# Initialize
psql -h localhost -p 5432 -U freshtrio_user -d freshtrio -f init-database.sql

# Clear
psql -h localhost -p 5432 -U freshtrio_user -d freshtrio -f clear-database.sql
```

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Check host/port/credentials
- Verify database exists

### Permission Issues
- Ensure script is executable: `chmod +x run-database-script.sh`
- Check database user has proper permissions

### Docker Database
If using Docker Compose:
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs postgres

# Connect to database directly
docker-compose exec postgres psql -U freshtrio_user -d freshtrio
```