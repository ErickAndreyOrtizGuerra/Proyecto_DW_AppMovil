@echo off
echo 🔄 Actualizando dependencias para compatibilidad con Expo SDK 54...
echo.

echo 📱 Deteniendo servidor actual...
taskkill /f /im node.exe 2>nul

echo 🗑️ Limpiando cache...
call npm cache clean --force
call npx expo install --fix

echo 📦 Instalando dependencias actualizadas...
call npx expo install expo-barcode-scanner@~13.0.1
call npx expo install expo-camera@~17.0.8
call npx expo install expo-document-picker@~14.0.7
call npx expo install expo-file-system@~19.0.17
call npx expo install expo-print@~15.0.7
call npx expo install expo-sharing@~14.0.7

echo.
echo ✅ ¡Dependencias actualizadas!
echo.
echo 📱 IMPORTANTE: Para usar el scanner de códigos QR/placas:
echo    - El scanner NO funciona en Expo Go
echo    - Necesitas usar un Development Build
echo    - O probar en un dispositivo físico con Expo Dev Client
echo.
echo 🚀 Para continuar con Expo Go (sin scanner):
echo    npm start
echo.
echo 📋 Para crear Development Build:
echo    npx expo run:android
echo    npx expo run:ios
echo.
pause
