@echo off
setlocal enabledelayedexpansion
title JICATE Solutions - Tally Bridge Installer

:: ============================================
::   JICATE Solutions - Tally Bridge Installer
:: ============================================

echo.
echo ============================================
echo   JICATE Solutions - Tally Bridge Installer
echo   Version 1.0
echo ============================================
echo.

:: --------------------------------------------
:: CHECK ADMIN RIGHTS
:: --------------------------------------------
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [NOTE] This script is NOT running as Administrator.
    echo        Some steps may need admin rights.
    echo        If anything fails, right-click this file
    echo        and choose "Run as administrator".
    echo.
)

:: --------------------------------------------
:: CHECK NODE.JS
:: --------------------------------------------
echo Checking for Node.js...
echo.

node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js is NOT installed on this computer.
    echo.
    echo     Opening the Node.js download page in your browser...
    start https://nodejs.org
    echo.
    echo ============================================
    echo   Install Node.js from the page that opened.
    echo   Click the big green "LTS" button.
    echo   Run the installer, click Next through everything.
    echo   Then come back here and press any key.
    echo ============================================
    echo.
    pause
    echo.
    echo Checking again for Node.js...
    node --version >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo.
        echo [ERROR] Node.js is still not detected.
        echo         Please restart this script after installing Node.js.
        echo         You may need to close and reopen this window first.
        echo.
        pause
        exit /b 1
    )
)

:: Get the version number
for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VER=%%v

:: Extract major version number (remove 'v' prefix, get first number before '.')
set NODE_VER_NUM=%NODE_VER:v=%
for /f "tokens=1 delims=." %%a in ("%NODE_VER_NUM%") do set NODE_MAJOR=%%a

if %NODE_MAJOR% GEQ 18 (
    echo   Node.js %NODE_VER% found [OK]
) else (
    echo   [WARNING] Node.js %NODE_VER% found, but it is outdated.
    echo             Version 18 or newer is recommended.
    echo             Please update from https://nodejs.org when possible.
    echo             Continuing anyway...
)
echo.

:: --------------------------------------------
:: FIND THE USB DRIVE
:: --------------------------------------------
echo Looking for bridge files on USB drive...
echo.

set "SOURCE="

if exist "D:\tally-bridge" (
    set "SOURCE=D:\tally-bridge"
    echo   Found bridge files on D: drive [OK]
) else if exist "E:\tally-bridge" (
    set "SOURCE=E:\tally-bridge"
    echo   Found bridge files on E: drive [OK]
) else if exist "F:\tally-bridge" (
    set "SOURCE=F:\tally-bridge"
    echo   Found bridge files on F: drive [OK]
) else if exist "G:\tally-bridge" (
    set "SOURCE=G:\tally-bridge"
    echo   Found bridge files on G: drive [OK]
)

if not defined SOURCE (
    echo   Could not find tally-bridge folder automatically.
    echo.
    set /p "DRIVE=  Enter the drive letter of your USB drive (e.g., D): "

    :: Validate drive letter is a single character A-Z
    echo !DRIVE! | findstr /r "^[A-Za-z]$" >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo.
        echo [ERROR] Please enter a single drive letter (e.g., D)
        echo.
        pause
        exit /b 1
    )

    set "SOURCE=!DRIVE!:\tally-bridge"

    if not exist "!SOURCE!" (
        echo.
        echo [ERROR] Could not find "!SOURCE!"
        echo         Make sure the USB drive is inserted and has a
        echo         folder called "tally-bridge" on it.
        echo.
        pause
        exit /b 1
    )
    echo   Found bridge files on !DRIVE!: drive [OK]
)
echo.

:: --------------------------------------------
:: COPY BRIDGE FILES
:: --------------------------------------------
echo Copying bridge files to C:\tally-bridge...
echo This may take a minute...
echo.

xcopy /E /I /Y "%SOURCE%" "C:\tally-bridge" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Could not copy files from the USB drive.
    echo         Is the USB drive inserted properly?
    echo         Try removing and re-inserting it.
    echo.
    pause
    exit /b 1
)

echo   Files copied [OK]
echo.

:: Create data directory for queue database
if not exist "C:\tally-bridge\data" mkdir "C:\tally-bridge\data"

:: --------------------------------------------
:: INSTALL DEPENDENCIES
:: --------------------------------------------
echo Installing required software packages...
echo This may take 2-3 minutes depending on internet speed...
echo.

cd /d "C:\tally-bridge"
call npm install > "C:\tally-bridge\install-log.txt" 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Software installation failed.
    echo         Check that this computer has internet access.
    echo         Try opening a browser and going to google.com
    echo         If the internet works, send the file
    echo         C:\tally-bridge\install-log.txt to the tech team.
    echo.
    pause
    exit /b 1
)

echo   Packages installed [OK]
echo.

:: --------------------------------------------
:: BUILD THE BRIDGE
:: --------------------------------------------
if exist "C:\tally-bridge\dist\main.js" (
    echo   Pre-built bridge found [OK] (skipping build)
) else (
    echo Building the bridge...
    echo This may take a minute...
    echo.

    cd /d "C:\tally-bridge"
    call npm run build >nul 2>&1
    if !ERRORLEVEL! neq 0 (
        echo [ERROR] Build failed.
        echo         Take a screenshot of this window and
        echo         contact the tech team.
        echo.
        pause
        exit /b 1
    )
    echo   Bridge built [OK]
)
echo.

:: --------------------------------------------
:: VERIFY INSTALLATION
:: --------------------------------------------
echo Verifying installation...
echo.

if exist "C:\tally-bridge\dist\main.js" (
    echo.
    echo ============================================
    echo.
    echo   Tally Bridge installed successfully!
    echo.
    echo   Next steps:
    echo   1. Open Command Prompt
    echo   2. Type: cd C:\tally-bridge ^&^& claude
    echo   3. Type: /tally-bridge setup
    echo.
    echo ============================================
    echo.
) else (
    echo [ERROR] Installation did not complete properly.
    echo         The bridge files are missing.
    echo         Take a screenshot and contact the tech team.
    echo.
)

:: --------------------------------------------
:: KEEP WINDOW OPEN
:: --------------------------------------------
pause
