@echo off
echo 🖨️ Instalando dependencias para generación de PDF...
echo.

echo 📄 Instalando expo-print...
call npx expo install expo-print
if %errorlevel% neq 0 (
    echo ❌ Error instalando expo-print
    pause
    exit /b 1
)

echo 📤 Instalando expo-sharing...
call npx expo install expo-sharing
if %errorlevel% neq 0 (
    echo ❌ Error instalando expo-sharing
    pause
    exit /b 1
)

echo 📁 Instalando expo-file-system...
call npx expo install expo-file-system
if %errorlevel% neq 0 (
    echo ❌ Error instalando expo-file-system
    pause
    exit /b 1
)

echo 📋 Instalando expo-document-picker...
call npx expo install expo-document-picker
if %errorlevel% neq 0 (
    echo ❌ Error instalando expo-document-picker
    pause
    exit /b 1
)

echo.
echo ✅ ¡Dependencias de PDF instaladas correctamente!
echo.
echo 🚀 Para probar las funcionalidades de PDF, ejecuta:
echo    npm start
echo.
pause
