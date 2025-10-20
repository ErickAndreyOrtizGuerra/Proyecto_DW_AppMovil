@echo off
echo 📱 Conexión Manual a Expo Go
echo.

echo 🔍 Busca tu IP local...
ipconfig | findstr "IPv4"
echo.

echo 📋 Instrucciones:
echo 1. Abre Expo Go en tu teléfono
echo 2. Toca "Enter URL manually"
echo 3. Ingresa: exp://[TU_IP]:8081
echo    Ejemplo: exp://192.168.1.100:8081
echo.

echo 🌐 O usa la URL web:
echo http://localhost:8081
echo.

echo 🚀 Iniciando servidor...
call npm start

pause
