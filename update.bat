@echo off
rem Double-click to update Capri on the server PC: pulls the latest code from GitHub, installs packages,
rem and rebuilds the desktop app when its version changes so installed apps update themselves.
rem If Capri is running with "npm run serve" it restarts itself; the website updates on the next page refresh.
cd /d "%~dp0"
node scripts\update.mjs || goto :failed
pause
exit /b 0
:failed
echo.
echo Update failed. See the message above.
pause
exit /b 1
