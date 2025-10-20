@echo off
echo 🔄 Forzando modo Expo Go...
echo.

echo 🛑 Deteniendo servidor...
taskkill /f /im node.exe 2>nul

echo 🗑️ Limpiando configuración de Development Client...
rmdir /s /q .expo 2>nul
del app.config.js 2>nul
del expo.json 2>nul

echo 📱 Iniciando en modo Expo Go forzado...
call npx expo start --go

pause
