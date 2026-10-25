@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 from https://nodejs.org/en/download then reopen this window.
  pause
  exit /b 1
)
node scripts\check-runtime.mjs
if errorlevel 1 (pause & exit /b 1)
if not exist node_modules\next\package.json (
  call npm ci
  if errorlevel 1 (pause & exit /b 1)
)
echo Open http://127.0.0.1:3003 in your browser. Press Ctrl+C here to stop.
call npm run dev:local
pause
