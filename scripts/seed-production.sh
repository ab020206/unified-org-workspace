#!/usr/bin/env bash

# Production Safe Initialization & Seeding Script

set -e

echo "🌱 Initializing Production Database Schema & Feature Flags..."

npm run db:generate --workspace=server
npm run db:migrate --workspace=server

echo "🚀 Executing production seed script..."
npm run db:seed --workspace=server

echo "✨ Production environment initialized successfully!"
