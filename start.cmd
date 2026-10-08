@echo off
rem Windows: set up and start the backend + frontend. Ctrl+C stops both. Options: --reset, --open, --help
rem The real script is scripts\start.mjs (Node.js), so it behaves the same on every OS.
where node >nul 2>nul || (echo Node.js 20+ is required: https://nodejs.org & exit /b 1)
node "%~dp0scripts\start.mjs" %*
