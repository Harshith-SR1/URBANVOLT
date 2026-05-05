#!/bin/bash
# Cleanup script for URBANVOLT

echo "🧹 Cleaning up URBANVOLT..."
echo ""

# Stop containers
echo "Stopping containers..."
docker-compose down

# Remove images
echo "Removing images..."
docker rmi urbanvolt-backend:1.0 2>/dev/null
docker rmi urbanvolt-frontend:1.0 2>/dev/null

# Remove volumes
echo "Removing volumes..."
docker volume rm urbanvolt_postgres_data 2>/dev/null

# Clean cache
echo "Cleaning cache..."
rm -rf backend/__pycache__ 2>/dev/null
rm -rf backend/.pytest_cache 2>/dev/null
rm -rf frontend/node_modules/.cache 2>/dev/null

echo ""
echo "✓ Cleanup complete!"
