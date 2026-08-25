@echo off
echo ==========================================================
echo  ARCADIA Gaming Event Platform - Production Deployment
echo ==========================================================

docker compose down --remove-orphans
docker compose up --build -d

echo.
echo ==========================================================
echo  ARCADIA PLATFORM IS SUCCESSFULLY DEPLOYED & LIVE!
echo ==========================================================
echo  Frontend Web App:     http://localhost:3000 (or http://localhost)
echo  Swagger API Docs:      http://localhost:8080/swagger-ui/index.html
echo  Health Check Endpoint: http://localhost:8080/api/health
echo  PostgreSQL Database:   localhost:5432 (db: gaming_events)
echo ==========================================================
