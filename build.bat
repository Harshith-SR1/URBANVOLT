@echo off
REM Build script for URBANVOLT on Windows

echo.
echo 🏗️  Building URBANVOLT...
echo.

REM Backend build
echo Building Backend Docker image...
docker build -t urbanvolt-backend:1.0 ./backend
if errorlevel 1 (
    echo Backend build failed
    exit /b 1
)

REM Frontend build
echo.
echo Building Frontend Docker image...
docker build -t urbanvolt-frontend:1.0 ./frontend
if errorlevel 1 (
    echo Frontend build failed
    exit /b 1
)

echo.
echo ✓ Build complete!
echo.
echo To run with Docker Compose:
echo   docker-compose up -d
echo.
echo To check images:
echo   docker images ^| findstr urbanvolt
