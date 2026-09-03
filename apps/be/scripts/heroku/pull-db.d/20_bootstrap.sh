#!/bin/bash

# Pull the database from Heroku and restore it to the local database
# Options:
# --latest: Use the latest existing backup from Heroku
# DATABASE_URL or prisma.url: The name of the database to restore to
# DATABASE_NAME: Custom database name to restore to
# HEROKU_APP_NAME or heroku.appName: Custom Heroku app name to restore from
# HEROKU_DATABASE_URL or heroku.databaseUrl: Custom Heroku database URL to restore from

set -e

echo "🔄 Heroku Database Pull Tool"

# Check required dependencies
for cmd in heroku psql pg_restore grep sed; do
    command -v $cmd >/dev/null || { echo "❌ $cmd not found"; exit 1; }
done

DATABASE_URL=${DATABASE_URL:-$(yarn resolve-config get --target resolved --property prisma.url 2>/dev/null || echo "")}
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Could not determine local database URL"
    echo "Please set DATABASE_URL environment variable or ensure config is properly set up"
    exit 1
fi

# Extract database credentials from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DATABASE_NAME=${DATABASE_NAME:-$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')}

DATABASE_MAINTENANCE_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
DATABASE_RESTORE_URL=$(echo $DATABASE_URL | sed "s/\/${DATABASE_MAINTENANCE_NAME}/\/${DATABASE_NAME}/")

if ! heroku auth:whoami &> /dev/null; then
    heroku login
fi

HEROKU_USER=$(heroku auth:whoami)
HEROKU_APP_NAME=${HEROKU_APP_NAME:-$(yarn resolve-config get --target resolved --property heroku.appName)}

# Get the default app from Heroku CLI if no app name is set
if [ -z "$HEROKU_APP_NAME" ]; then
    HEROKU_DEFAULT_APP=$(heroku apps:info --json 2>/dev/null | jq -r '.name' 2>/dev/null || echo "")
    if [ -n "$HEROKU_DEFAULT_APP" ]; then
        HEROKU_APP_NAME=$HEROKU_DEFAULT_APP
    fi
fi

HEROKU_DATABASE_URL_CONFIG=$(yarn resolve-config get --target resolved --property heroku.databaseUrl)
HEROKU_DATABASE_URL=${HEROKU_DATABASE_URL:-${HEROKU_DATABASE_URL_CONFIG:-"DATABASE_URL"}}

# Get local PostgreSQL version
LOCAL_PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
if [ -z "$LOCAL_PG_VERSION" ]; then
    echo "❌ Could not determine local PostgreSQL version. Make sure psql is installed and in PATH."
    exit 1
fi

BACKUP_FILE=$(mktemp)

# Confirm before proceeding
echo ""
echo "⚠️  WARNING: This will replace your local database!"
echo "Heroku User: $HEROKU_USER"
echo "Heroku App: $HEROKU_APP_NAME"
echo "Heroku Database: $HEROKU_DATABASE_URL"
echo "Backup file: $BACKUP_FILE"
echo "Target DB Url: $DATABASE_RESTORE_URL"
echo "Target DB Name: $DATABASE_NAME"
echo ""
echo "Do you want to continue? (y/n)"
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Operation cancelled"
    exit 0
fi


DB_EXISTS=$(psql "$DATABASE_URL" -lqt | cut -d \| -f 1 | grep -w "$DATABASE_NAME" | wc -l)
if [ $DB_EXISTS -gt 0 ]; then
    echo "Would you like to delete and reset the existing database "${DATABASE_NAME}" before restoring? (y/n)"
    read -r DELETE_DB
    
    if [ "$DELETE_DB" = "y" ] || [ "$DELETE_DB" = "Y" ]; then
        echo "🗑️  Resetting database '$DATABASE_NAME'..."
        psql "$DATABASE_URL" -c "DROP DATABASE IF EXISTS \"$DATABASE_NAME\";" 2>/dev/null || true
        psql "$DATABASE_URL" -c "CREATE DATABASE \"$DATABASE_NAME\";" 2>/dev/null || true
    fi
else
    # Create database
    psql "$DATABASE_URL" -c "CREATE DATABASE \"$DATABASE_NAME\";" 2>/dev/null || true
fi

psql "$DATABASE_RESTORE_URL" -c "CREATE SCHEMA IF NOT EXISTS heroku_ext;" 2>/dev/null || true
psql "$DATABASE_RESTORE_URL" -c "CREATE SCHEMA IF NOT EXISTS _heroku;" 2>/dev/null || true

if [ "$1" = "--latest" ]; then
    echo "📋 Using latest existing backup from Heroku..."
else
    echo "🔄 Creating backup on Heroku..."
    heroku pg:backups:capture --app $HEROKU_APP_NAME
fi

echo "📥 Downloading backup from Heroku to $BACKUP_FILE"
heroku pg:backups:download --app $HEROKU_APP_NAME --output $BACKUP_FILE

echo "🔧 Filtering out incompatible Heroku configurations..."
FULL_BACKUP_FILE=$(mktemp)
FILTERED_BACKUP_FILE=$(mktemp)
pg_restore --no-acl --no-owner -f "$FULL_BACKUP_FILE" "$BACKUP_FILE"
grep -v "transaction_timeout" "$FULL_BACKUP_FILE" > $FILTERED_BACKUP_FILE
rm -f "$FULL_BACKUP_FILE"


echo "🔄 Restoring database..."
psql -d "$DATABASE_RESTORE_URL" -f $FILTERED_BACKUP_FILE

echo "🧹 Cleaning up backup files..."
rm -f "$BACKUP_FILE" "$FILTERED_BACKUP_FILE"

echo "✅ Done"