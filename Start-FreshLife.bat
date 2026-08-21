@echo off
title FreshLife AI
color 0B

echo ===================================================
echo             Starting FreshLife AI
echo ===================================================
echo.
echo Launching the local offline server...
echo.

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Please install Python to run the local server.
    pause
    exit /b
)

python start.py
