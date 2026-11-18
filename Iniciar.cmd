@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Se requiere Node.js 20 o posterior. Consulta README.md.
  pause
  exit /b 1
)
node scripts\serve.cjs --open
if errorlevel 1 pause
