@echo off
title Push Fitna-AI to GitHub
color 0A
echo ===================================================
echo   Fitna AI - Deploying Login Fix to GitHub/Vercel
echo ===================================================
echo.
cd /d "%~dp0"
git push origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo   SUCCESS! Pushed to GitHub successfully!
    echo   Vercel is now building and deploying your fix.
    echo ===================================================
) else (
    echo ===================================================
    echo   Push encountered an error.
    echo ===================================================
)
echo.
pause
