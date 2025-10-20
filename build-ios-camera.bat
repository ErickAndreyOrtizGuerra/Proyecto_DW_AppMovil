@echo off
echo 📱 Creando build de iOS con cámara en la nube...
echo.

echo 🔧 Instalando EAS CLI...
call npm install -g @expo/eas-cli

echo 🔑 Configurando EAS...
call eas login

echo 📦 Configurando proyecto...
call eas build:configure

echo 🚀 Iniciando build de iOS en la nube...
call eas build -p ios --profile development

echo.
echo ✅ ¡Build iniciado en la nube!
echo 📱 Recibirás un enlace para descargar la app con cámara
echo 📧 Revisa tu email para el enlace de descarga
echo.
pause
