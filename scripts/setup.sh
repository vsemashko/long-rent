#!/bin/bash

# Initial project setup script
# Usage: ./scripts/setup.sh

set -e

echo "🏗️  Setting up HomeMore development environment..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You'll need Docker for local development."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
else
    echo "✅ Docker $(docker --version)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your configuration."
else
    echo "ℹ️  .env file already exists"
fi

# Start Docker services
if command -v docker &> /dev/null; then
    echo "🐳 Starting Docker services..."
    docker-compose up -d

    echo "⏳ Waiting for services to be ready..."
    sleep 5

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Docker services are running"
    else
        echo "⚠️  Some Docker services may not be running. Check with: docker-compose ps"
    fi
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate --filter=database

# Run database migrations
echo "🗄️  Running database migrations..."
npm run db:migrate --filter=database || echo "⚠️  Migration failed. Make sure database is running."

# Seed database
echo "🌱 Seeding database..."
npm run db:seed --filter=database || echo "⚠️  Seeding failed. You can run it later with: npm run db:seed"

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your configuration"
echo "  2. Start the development server: npm run dev"
echo "  3. Open http://localhost:3000 in your browser"
echo "  4. API documentation: http://localhost:3001/api/docs"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development servers"
echo "  npm test             - Run tests"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  docker-compose logs  - View database logs"
echo ""
