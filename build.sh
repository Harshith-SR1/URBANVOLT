#!/bin/bash
# Build script for URBANVOLT

echo "🏗️ Building URBANVOLT..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Backend build
echo -e "${YELLOW}Building Backend Docker image...${NC}"
docker build -t urbanvolt-backend:1.0 ./backend
if [ $? -ne 0 ]; then
    echo -e "${RED}Backend build failed${NC}"
    exit 1
fi

# Frontend build
echo ""
echo -e "${YELLOW}Building Frontend Docker image...${NC}"
docker build -t urbanvolt-frontend:1.0 ./frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Build complete!${NC}"
echo ""
echo "To run with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To check images:"
echo "  docker images | grep urbanvolt"
