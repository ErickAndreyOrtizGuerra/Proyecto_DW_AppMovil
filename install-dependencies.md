# 📦 Instalación de Dependencias

Para instalar las dependencias correctas para Expo SDK 54, ejecuta los siguientes comandos:

## 1. Instalar dependencias base
```bash
npm install
```

## 2. Instalar dependencias de Expo (versiones compatibles)
```bash
npx expo install @react-native-async-storage/async-storage
npx expo install expo-barcode-scanner
npx expo install expo-camera  
npx expo install expo-notifications
```

## 3. Verificar instalación
```bash
npx expo doctor
```

## 4. Iniciar la aplicación
```bash
npm start
```

## Versiones Compatibles con Expo SDK 54:
- `@react-native-async-storage/async-storage`: ~1.23.1
- `expo-barcode-scanner`: ~13.0.1
- `expo-camera`: ~15.0.16
- `expo-notifications`: ~0.29.7

## Si hay problemas:
1. Eliminar node_modules: `rm -rf node_modules`
2. Limpiar cache: `npm cache clean --force`
3. Reinstalar: `npm install`
4. Usar expo install: `npx expo install --fix`
