#!/bin/bash

# Deployment script for production environment
# Usage: ./scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."
echo "⚠️  WARNING: This will deploy to PRODUCTION!"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Check if required environment variables are set
required_vars=("PROD_HOST" "DATABASE_URL" "VERCEL_TOKEN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

# Run tests
echo "🧪 Running tests..."
npm test

# Build applications
echo "📦 Building applications..."
npm run build

# Backup database
echo "💾 Creating database backup..."
./scripts/backup-database.sh

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate:deploy --filter=database

# Deploy frontend (Vercel)
echo "🌐 Deploying frontend to Vercel..."
cd apps/web
vercel --prod --token=$VERCEL_TOKEN --scope=$VERCEL_ORG
cd ../..

# Deploy backend (Docker/AWS)
echo "🐳 Deploying backend..."
# Add your backend deployment logic here

# Health check
echo "🏥 Running health checks..."
sleep 10
curl -f https://api.homemore.pl/api/health || exit 1

echo "✅ Production deployment complete!"
echo "🔗 Frontend: https://homemore.pl"
echo "🔗 API: https://api.homemore.pl"
