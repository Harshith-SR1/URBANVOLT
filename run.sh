#!/bin/bash
# URBANVOLT Quick Start Script

echo "🚗⚡ URBANVOLT - Smart EV Charging Management System"
echo "=================================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${RED}✗ Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

# Backend setup
setup_backend() {
    echo -e "${YELLOW}📦 Setting up Backend...${NC}"
    
    if ! check_port 8000; then
        echo "Please free up port 8000 or modify the port in main.py"
        return 1
    fi
    
    cd backend
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cp .env.example .env
    fi
    
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}Creating virtual environment...${NC}"
        python -m venv venv
    fi
    
    # Activate venv
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip install -r requirements.txt
    
    cd ..
    echo -e "${GREEN}✓ Backend setup complete${NC}"
    return 0
}

# Frontend setup
setup_frontend() {
    echo -e "${YELLOW}🎨 Setting up Frontend...${NC}"
    
    if ! check_port 5173; then
        echo "Please free up port 5173 or modify the port in vite.config.js"
        return 1
    fi
    
    cd frontend
    
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}Creating .env file...${NC}"
        cp .env.example .env
    fi
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing npm dependencies...${NC}"
        npm install
    fi
    
    cd ..
    echo -e "${GREEN}✓ Frontend setup complete${NC}"
    return 0
}

# Run backend
run_backend() {
    echo ""
    echo -e "${GREEN}🚀 Starting Backend Server...${NC}"
    echo -e "${YELLOW}API will be available at: http://localhost:8000${NC}"
    echo -e "${YELLOW}Docs at: http://localhost:8000/docs${NC}"
    echo ""
    
    cd backend
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Run frontend
run_frontend() {
    echo ""
    echo -e "${GREEN}🎨 Starting Frontend Dev Server...${NC}"
    echo -e "${YELLOW}App will be available at: http://localhost:5173${NC}"
    echo ""
    
    cd frontend
    npm run dev
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "1) Full Setup (Backend + Frontend)"
    echo "2) Backend Only"
    echo "3) Frontend Only"
    echo "4) Run Both (requires 2 terminals)"
    echo "5) Run Backend Only"
    echo "6) Run Frontend Only"
    echo "7) Exit"
    echo ""
    read -p "Enter your choice (1-7): " choice
}

# Main logic
main() {
    while true; do
        show_menu
        
        case $choice in
            1)
                if setup_backend && setup_frontend; then
                    echo -e "${GREEN}✓ Setup complete!${NC}"
                    echo ""
                    echo "To start the application:"
                    echo "  Terminal 1: ./run.sh (then select option 5)"
                    echo "  Terminal 2: ./run.sh (then select option 6)"
                    echo ""
                fi
                ;;
            2)
                setup_backend
                ;;
            3)
                setup_frontend
                ;;
            4)
                echo -e "${YELLOW}Please run this script in 2 separate terminals${NC}"
                echo "Terminal 1: Run Backend (option 5)"
                echo "Terminal 2: Run Frontend (option 6)"
                ;;
            5)
                run_backend
                ;;
            6)
                run_frontend
                ;;
            7)
                echo -e "${GREEN}Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                ;;
        esac
    done
}

main
