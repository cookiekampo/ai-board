@echo off
setlocal
cd /d "%~dp0"
chcp 65001 > nul
set PYTHONUTF8=1
echo AI Board web manual mode
echo.
python web_manual.py
echo.
echo Server stopped or failed to start.
pause
