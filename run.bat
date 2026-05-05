@echo off
REM URBANVOLT Quick Start Script for Windows
REM ==========================================

setlocal enabledelayedexpansion

echo.
echo 🚗⚡ URBANVOLT - Smart EV Charging Management System
echo ==================================================
echo.

:menu
echo.
echo Select an option:
echo 1) Full Setup (Backend + Frontend)
echo 2) Backend Only
echo 3) Frontend Only
echo 4) Run Both (requires 2 terminals)
echo 5) Run Backend Only
echo 6) Run Frontend Only
echo 7) Exit
echo.
set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto full_setup
if "%choice%"=="2" goto backend_setup
if "%choice%"=="3" goto frontend_setup
if "%choice%"=="4" goto run_both
if "%choice%"=="5" goto run_backend
if "%choice%"=="6" goto run_frontend
if "%choice%"=="7" goto end
echo Invalid option. Please try again.
goto menu

:full_setup
echo.
echo 📦 Setting up Backend...
call :setup_backend
if errorlevel 1 goto menu
echo.
echo 🎨 Setting up Frontend...
call :setup_frontend
if errorlevel 1 goto menu
echo ✓ Setup complete!
echo.
echo To start the application:
echo   Terminal 1: run.bat (then select option 5)
echo   Terminal 2: run.bat (then select option 6)
goto menu

:backend_setup
call :setup_backend
if errorlevel 1 goto menu
goto menu

:frontend_setup
call :setup_frontend
if errorlevel 1 goto menu
goto menu

:run_both
echo.
echo Please run this script in 2 separate terminals
echo Terminal 1: Run Backend (option 5)
echo Terminal 2: Run Frontend (option 6)
goto menu

:run_backend
echo.
echo 🚀 Starting Backend Server...
echo API will be available at: http://localhost:8000
echo Docs at: http://localhost:8000/docs
echo.
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
cd ..
goto menu

:run_frontend
echo.
echo 🎨 Starting Frontend Dev Server...
echo App will be available at: http://localhost:5173
echo.
cd frontend
if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)
call npm run dev
cd ..
goto menu

:end
echo.
echo Goodbye!
exit /b 0

REM Functions

:setup_backend
cd backend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing Python dependencies...
pip install -r requirements.txt
cd ..
exit /b 0

:setup_frontend
cd frontend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
)

if not exist node_modules (
    echo Installing npm dependencies...
    call npm install
)

cd ..
exit /b 0
