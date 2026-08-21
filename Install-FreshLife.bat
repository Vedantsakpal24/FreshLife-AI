@echo off
title FreshLife AI - Installer
color 0A

echo ===================================================
echo       FreshLife AI - Local Offline Installer
echo ===================================================
echo.
echo This will install the necessary local components for 
echo FreshLife AI to run offline on your machine.
echo.

:: Check Node.js
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b
)

echo [1/3] Node.js found. Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b
)

echo.
echo [2/3] Building the static Progressive Web App (PWA)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build the application.
    pause
    exit /b
)
cd ..

echo.
echo [3/3] Installation Complete!
echo.
echo ===================================================
echo FreshLife AI is now ready to run entirely offline!
echo.
echo Double-click 'Start-FreshLife.bat' to launch the app.
echo ===================================================
pause
