#!/bin/bash

# Database backup script
# Usage: ./scripts/backup-database.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/homemore_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "💾 Creating database backup..."

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_URL=${DATABASE_URL:-$DATABASE_URL_UNPOOLED}

if [ -z "$DB_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    exit 1
fi

# Parse connection string
DB_USER=$(echo $DB_URL | sed -e 's/.*:\/\/\(.*\):.*@.*/\1/')
DB_PASS=$(echo $DB_URL | sed -e 's/.*:\/\/.*:\(.*\)@.*/\1/')
DB_HOST=$(echo $DB_URL | sed -e 's/.*@\(.*\):.*/\1/')
DB_PORT=$(echo $DB_URL | sed -e 's/.*:\([0-9]*\)\/.*/\1/')
DB_NAME=$(echo $DB_URL | sed -e 's/.*\/\(.*\)?.*/\1/' | sed -e 's/?.*//')

# Create backup
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "🧹 Cleaned up old backups (>30 days)"
