@echo off
REM Cleanup script for URBANVOLT on Windows

echo.
echo 🧹 Cleaning up URBANVOLT...
echo.

REM Stop containers
echo Stopping containers...
docker-compose down

REM Remove images
echo Removing images...
docker rmi urbanvolt-backend:1.0 2>nul
docker rmi urbanvolt-frontend:1.0 2>nul

REM Remove volumes
echo Removing volumes...
docker volume rm urbanvolt_postgres_data 2>nul

echo.
echo ✓ Cleanup complete!
