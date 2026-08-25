#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 ARCADIA Gaming Event Platform - Production Deployment"
echo "=========================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed. Please install Docker and Docker Compose."
    exit 1
fi

echo "📦 1. Building and starting all multi-container services..."
docker compose down --remove-orphans
docker compose up --build -d

echo "⏳ 2. Waiting for backend healthcheck on http://localhost:8080/api/health..."
RETRIES=30
until curl -s http://localhost:8080/api/health | grep -q "UP"; do
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -le 0 ]; then
        echo "❌ Backend failed to report healthy status in time."
        docker compose logs backend
        exit 1
    fi
    echo "   ...waiting for backend and database ($RETRIES attempts remaining)"
    sleep 3
done

echo ""
echo "=========================================================="
echo "🎉 ARCADIA PLATFORM IS SUCCESSFULLY DEPLOYED & LIVE!"
echo "=========================================================="
echo "🌐 Frontend Web App:     http://localhost:3000 (or http://localhost)"
echo "📖 Swagger API Docs:      http://localhost:8080/swagger-ui/index.html"
echo "🩺 Health Check Endpoint: http://localhost:8080/api/health"
echo "🐘 PostgreSQL Database:   localhost:5432 (db: gaming_events)"
echo "=========================================================="
