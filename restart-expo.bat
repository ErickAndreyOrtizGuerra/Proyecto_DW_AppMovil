@echo off
echo 🔄 Reiniciando Expo completamente...
echo.

echo 🛑 Matando procesos de Node...
taskkill /f /im node.exe 2>nul

echo 🧹 Limpiando cache...
call npx expo install --fix
call npm cache clean --force

echo 📱 Reiniciando Expo Go en tu teléfono también
echo.

echo 🚀 Iniciando con túnel...
call npx expo start --tunnel

pause
