@echo off
echo 🚛 Instalando dependencias para Transportes Ultrarrápidos App...
echo.

echo 📦 Paso 1: Instalando dependencias base...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias base
    pause
    exit /b 1
)

echo.
echo 📱 Paso 2: Instalando AsyncStorage...
call npx expo install @react-native-async-storage/async-storage
if %errorlevel% neq 0 (
    echo ⚠️ Error con AsyncStorage, continuando...
)

echo.
echo 📷 Paso 3: Instalando Scanner (Barcode Scanner)...
call npx expo install expo-barcode-scanner
if %errorlevel% neq 0 (
    echo ⚠️ Error con Barcode Scanner, continuando...
)

echo.
echo 📸 Paso 4: Instalando Cámara...
call npx expo install expo-camera
if %errorlevel% neq 0 (
    echo ⚠️ Error con Camera, continuando...
)

echo.
echo 🔔 Paso 5: Instalando Notificaciones...
call npx expo install expo-notifications
if %errorlevel% neq 0 (
    echo ⚠️ Error con Notifications, continuando...
)

echo.
echo 🔧 Paso 6: Verificando compatibilidad...
call npx expo doctor

echo.
echo ✅ ¡Instalación completada!
echo.
echo 🚀 Para iniciar la aplicación, ejecuta:
echo    npm start
echo.
pause
