@echo off
echo 🔄 Reseteando a Expo Go (sin Development Client)...
echo.

echo 🛑 Deteniendo procesos...
taskkill /f /im node.exe 2>nul

echo 🗑️ Desinstalando expo-dev-client...
call npm uninstall expo-dev-client

echo 🧹 Limpiando cache...
call npm cache clean --force
call npx expo install --fix

echo 📱 Eliminando carpetas de cache...
rmdir /s /q node_modules 2>nul
rmdir /s /q .expo 2>nul

echo 📦 Reinstalando dependencias...
call npm install

echo.
echo ✅ ¡Reseteo completado!
echo.
echo 📱 Ahora usarás Expo Go normal (no Development Client)
echo 🚀 Para iniciar: npm start
echo 📲 Escanea el QR con Expo Go (no con cámara normal)
echo.
pause
