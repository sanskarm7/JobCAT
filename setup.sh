#!/bin/bash
set -e

echo "Setting up Job Tracker development environment..."

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - please review the settings"
fi

# Create necessary directories
mkdir -p backend/logs

# Stop any existing containers
docker-compose down

# Start database
echo "Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "Waiting for database to start..."
sleep 10

# Install dependencies
echo "Installing backend dependencies..."
cd backend
npm install

# Run migrations
echo "Running database migrations..."
npm run db:migrate

# Run seeds
echo "Seeding database..."
npm run db:seed

echo "Setup complete! Run 'npm run dev' in the backend directory to start the server." 