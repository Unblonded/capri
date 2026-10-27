@echo off
rem Double-click to update Capri on the server PC: pulls the latest code from GitHub and installs any new packages.
rem If Capri is running with "npm run serve" it restarts itself; the website updates on the next page refresh.
cd /d "%~dp0"
git pull --ff-only || goto :failed
call npm install --omit=dev || goto :failed
echo.
echo Capri is up to date.
pause
exit /b 0
:failed
echo.
echo Update failed. See the message above.
pause
exit /b 1
