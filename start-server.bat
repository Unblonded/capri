@echo off
rem Double-click to run Capri on the server PC with auto-update: it checks GitHub every minute,
rem pulls and installs new commits, and restarts itself. Leave this window open (or minimised).
rem To start it when Windows starts: Win+R, type shell:startup, and put a shortcut to this file there.
title Capri server
cd /d "%~dp0"
:run
node scripts\autoserve.mjs
if %errorlevel%==75 goto run
echo.
echo Capri stopped.
pause
