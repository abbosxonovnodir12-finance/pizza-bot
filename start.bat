@echo off
chcp 65001 >nul
title Pizza Bot
cd /d "%~dp0"
node scripts\start.js
pause
