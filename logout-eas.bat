@echo off
echo 🚪 Cerrando sesión de EAS y Expo...
echo.

echo 📤 Cerrando sesión de EAS...
call npx eas logout 2>nul

echo 📤 Cerrando sesión de Expo CLI...
call npx expo logout 2>nul

echo 🗑️ Limpiando cache de Expo...
call npx expo install --fix 2>nul

echo 🧹 Desinstalando EAS CLI...
call npm uninstall -g @expo/eas-cli 2>nul

echo.
echo ✅ ¡Sesiones cerradas y limpieza completada!
echo.
echo 📱 Ahora puedes usar la app normalmente sin builds en la nube
echo 🔄 Para usar solo el scanner manual: npm start
echo.
pause
