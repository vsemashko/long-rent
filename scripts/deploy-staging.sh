#!/bin/bash

# Deployment script for staging environment
# Usage: ./scripts/deploy-staging.sh

set -e

echo "🚀 Starting staging deployment..."

# Check if required environment variables are set
if [ -z "$STAGING_HOST" ]; then
    echo "❌ Error: STAGING_HOST environment variable is not set"
    exit 1
fi

# Build applications
echo "📦 Building applications..."
npm run build

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
# Example: docker build, push to registry, update ECS service

echo "✅ Staging deployment complete!"
echo "🔗 Frontend: https://staging.homemore.pl"
echo "🔗 API: https://api-staging.homemore.pl"
