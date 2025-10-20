# 🚛 Transportes Ultrarrápidos - App Móvil

Aplicación móvil desarrollada con React Native y Expo para la gestión integral de una empresa de transportes con funcionalidades avanzadas de scanner y notificaciones.

## 📱 Características Principales

### 🚚 Gestión de Camiones
- **Lista completa** de la flota de vehículos
- **📱 Generador de códigos QR** integrado
- **🔍 15+ camiones disponibles** para generar QR
- **📊 Estadísticas en tiempo real** - Total, activos, mantenimiento
- **🔄 Pull-to-refresh** para actualizar datos
- **Información detallada** de cada camión (marca, modelo, año, capacidad)
- **Estados en tiempo real** (activo, mantenimiento, fuera de servicio)
- **Filtros avanzados** por estado y búsqueda optimizada
- **Vista de detalle** con información completa del vehículo

### 👥 Gestión de Transportistas
- **Directorio completo** de transportistas y empresas
- **Información de contacto** (teléfono, email, dirección)
- **Clasificación** entre empresas e independientes
- **Búsqueda rápida** por nombre o empresa

### 📊 Control de Movimientos
- **Registro de ingresos y egresos** de camiones
- **🔍 Scanner dedicado** con botón principal en pantalla
- **📱 Pantalla ScannerScreen** independiente y completa
- **✅ Validación guatemalteca** - P-, C-, TC-, M-, A-, O-, CD-, CC-
- **💡 Auto-completado inteligente** con sugerencias
- **📋 Generación de comprobantes PDF** automática
- **Formularios intuitivos** con validación
- **Historial completo** de movimientos
- **🔔 Notificaciones automáticas** de registros

### ⛽ Vales de Combustible
- **Emisión de vales** con numeración automática
- **Cálculo automático** de totales
- **Control de estados** (emitido, usado)
- **🔔 Notificaciones** de vales registrados
- **Historial completo** de vales

### 🔔 Sistema de Notificaciones
- **Notificaciones push** para eventos importantes
- **Configuración personalizable** por tipo de evento
- **Alertas de ingresos/egresos** registrados
- **Notificaciones de vales** de combustible
- **Recordatorios de mantenimiento** preventivo
- **Pantalla de configuración** completa

### 📷 Scanner Optimizado (Sin Cámara)
- **🔍 Pantalla dedicada** para escaneo manual inteligente
- **📱 Entrada manual optimizada** con auto-completado
- **✅ Validación en tiempo real** de formatos guatemaltecos
- **💡 Auto-completado** con 15+ placas comunes
- **🕒 Historial de escaneos** para reutilización rápida
- **📋 Selector de modo** - Placa vs Código QR
- **⚡ Acciones rápidas** - Ejemplos, limpiar, ayuda
- **🎯 100% compatible** con Expo Go (sin Development Build)

### 📈 Reportes y Estadísticas
- **Métricas generales** de la flota
- **Reportes operativos** (ingresos, egresos, combustible)
- **Análisis de productividad** por empleado
- **🔔 Acceso a configuración** de notificaciones
- **Exportación** de datos

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **React Navigation** - Navegación entre pantallas
- **Expo Camera** - Funcionalidad de cámara
- **Expo Barcode Scanner** - Scanner de códigos
- **Expo Notifications** - Sistema de notificaciones
- **AsyncStorage** - Almacenamiento local
- **Expo Linear Gradient** - Gradientes y efectos visuales
- **Expo Vector Icons** - Iconografía
- **JavaScript ES6+** - Lenguaje de programación

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Dispositivo móvil con Expo Go o emulador

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone [url-del-repositorio]
cd transportes-ultrarapidos-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Instalar dependencias adicionales**
```bash
npx expo install expo-camera expo-barcode-scanner expo-notifications @react-native-async-storage/async-storage
```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
```

5. **Ejecutar en dispositivo**
- Escanear el código QR con Expo Go (Android/iOS)
- O usar emulador: `npm run android` / `npm run ios`

## 📁 Estructura del Proyecto

```
transportes-ultrarapidos-app/
├── screens/                 # Pantallas de la aplicación
│   ├── CamionesScreen.js    # Lista de camiones
│   ├── CamionDetalleScreen.js # Detalle de camión
│   ├── TransportistasScreen.js # Lista de transportistas
│   ├── IngresoEgresoScreen.js # Control de movimientos
│   ├── ValesCombustibleScreen.js # Vales de combustible
│   ├── ReportesScreen.js    # Reportes y estadísticas
│   └── NotificacionesScreen.js # Configuración de notificaciones
├── components/              # Componentes reutilizables
│   ├── Card.js             # Componentes de tarjetas
│   ├── Typography.js       # Componentes de texto
│   ├── Button.js           # Componentes de botones
│   ├── PlateScanner.js     # Scanner de placas/QR
│   ├── FloatingSearch.js   # Búsqueda flotante optimizada
│   └── StableFormInput.js  # Inputs de formulario estables
├── services/               # Servicios y APIs
│   ├── transporteApi.js    # API de transportes
│   └── notificationService.js # Servicio de notificaciones
├── constants/              # Constantes y configuración
│   └── Design.js           # Sistema de diseño
├── App.js                  # Componente principal
├── app.json               # Configuración de Expo y permisos
└── package.json           # Dependencias del proyecto
```

## 🔐 Permisos y Configuración

### Permisos de iOS
- **NSCameraUsageDescription**: Acceso a cámara para scanner
- **NSMicrophoneUsageDescription**: Funciones de notificación

### Permisos de Android
- **CAMERA**: Acceso a cámara
- **RECORD_AUDIO**: Funciones de audio
- **RECEIVE_BOOT_COMPLETED**: Notificaciones persistentes
- **VIBRATE**: Vibración en notificaciones
- **WAKE_LOCK**: Mantener dispositivo activo

## 🎨 Sistema de Diseño

La aplicación utiliza un sistema de diseño consistente con:

- **Colores primarios**: Azules (#1E40AF, #3B82F6)
- **Tipografía**: Sistema nativo optimizado
- **Espaciado**: Sistema modular (4px, 8px, 16px, etc.)
- **Componentes**: Reutilizables y consistentes
- **Gradientes**: Efectos visuales modernos
- **Animaciones**: Transiciones fluidas y microinteracciones

## 📊 API y Datos

La aplicación consume datos de la API de Transportes Ultrarrápidos:
- **Base URL**: `https://transportes-ultrarapidos-api.uc.r.appspot.com/api/`
- **Endpoints**: `/camiones`, `/transportistas`
- **Datos reales**: 51 camiones y 19 transportistas

## 🔧 Funcionalidades Técnicas

### Optimizaciones de Performance
- **FlatList optimizada** para listas grandes
- **Lazy loading** de componentes
- **Memoización** de componentes pesados
- **Gestión eficiente** del estado
- **Componentes estables** que evitan re-renderizados

### Scanner Avanzado
- **Múltiples formatos**: QR, Code128, Code39, EAN13, EAN8
- **Validación de placas**: Formato guatemalteco (P-001AAA)
- **Flash automático**: Para condiciones de poca luz
- **Confirmación visual**: Feedback inmediato al usuario
- **Manejo de errores**: Validación y reintentos

### Sistema de Notificaciones
- **Notificaciones push locales**
- **Configuración personalizable**
- **Alertas automáticas de eventos**
- **Panel de administración completo**

### Experiencia de Usuario
- **Navegación fluida** con animaciones
- **Pull-to-refresh** en listas
- **Estados de carga** informativos
- **Validación** de formularios en tiempo real
- **Feedback visual** en todas las interacciones
- **Teclado estable** que no se cierra al escribir

## 📱 Pantallas Principales

### 1. Lista de Camiones
- Vista de tarjetas con información esencial
- **Búsqueda flotante** con animaciones
- Filtros por estado con chips visuales
- Navegación a vista de detalle

### 2. Control de Movimientos
- **Scanner integrado** para placas y QR
- Registro rápido de ingresos y egresos
- **Notificaciones automáticas** de registros
- Formularios con validación en tiempo real
- Selección rápida de camiones activos

### 3. Vales de Combustible
- Emisión con **notificaciones automáticas**
- Cálculo de totales en tiempo real
- Control de estados visual
- Historial con filtros avanzados

### 4. Configuración de Notificaciones
- **Panel de control completo**
- Activación/desactivación por tipo
- **Notificación de prueba**
- Información del dispositivo
- Limpieza de notificaciones programadas

### 5. Reportes
- **Acceso rápido** a configuración de notificaciones
- Métricas generales actualizadas
- Reportes operativos detallados
- Análisis de productividad

## ✅ Funcionalidades Implementadas

### ✅ Sistema de Scanner Completo (Sin Cámara)
- [x] **📱 ScannerScreen independiente** - Pantalla dedicada completa
- [x] **🔍 Entrada manual optimizada** - Sin dependencias de cámara
- [x] **💡 Auto-completado inteligente** - 15+ placas guatemaltecas comunes
- [x] **✅ Validación en tiempo real** - Feedback visual instantáneo
- [x] **📋 Selector de modo dual** - Placa vs Código QR
- [x] **🕒 Historial de escaneos** - Reutilización de datos anteriores
- [x] **⚡ Acciones rápidas** - Ejemplos, limpiar, ayuda contextual
- [x] **🎯 100% compatible Expo Go** - Sin Development Build necesario

### ✅ Generador de Códigos QR
- [x] **📱 QRGeneratorScreen completa** - Pantalla dedicada para generar QR
- [x] **🚛 15+ camiones disponibles** - Lista completa de la flota
- [x] **📊 Estadísticas dinámicas** - Total, activos, mantenimiento
- [x] **🔄 Pull-to-refresh** - Actualización manual de datos
- [x] **📱 Compartir QR** - Share nativo integrado
- [x] **🔗 Integración con Scanner** - QR generados funcionan en Scanner

### ✅ Sistema de Comprobantes PDF
- [x] **📄 Generación automática** - PDFs profesionales para movimientos
- [x] **🎨 Diseño corporativo** - Logo, colores y formato empresarial
- [x] **📋 Información completa** - Datos del camión, piloto, ruta, timestamps
- [x] **📱 Compartir/Imprimir** - Exportar comprobantes generados
- [x] **🔗 Integración total** - Desde registro hasta comprobante

### ✅ Validación de Formatos Guatemaltecos
- [x] **🇬🇹 15+ formatos oficiales** - P-, C-, TC-, M-, A-, O-, CD-, CC-
- [x] **✅ Validación estricta** - Patrones oficiales guatemaltecos
- [x] **💬 Mensajes descriptivos** - Errores claros y sugerencias
- [x] **🔧 Auto-formato** - Agrega guiones automáticamente
- [x] **⚠️ Modo permisivo** - Opción continuar con formatos no estándar

### ✅ Navegación y UX Mejorada
- [x] **📱 Stack Navigators** - CamionesStack, MovimientosStack, ReportesStack
- [x] **🔍 Botón Scanner principal** - Acceso directo desde Movimientos
- [x] **🎨 Diseño consistente** - Colores distintivos por función
- [x] **⚡ Flujo optimizado** - Scanner → Validación → Registro → PDF

### ✅ Aplicación Móvil Completa
- [x] Interfaz moderna y responsive
- [x] Navegación fluida entre pantallas
- [x] Sistema de diseño consistente

### ✅ Registro de Ingresos/Egresos
- [x] Formularios intuitivos y validados
- [x] **Scanner de placas/QR integrado**
- [x] **Notificaciones automáticas**
- [x] Historial completo de movimientos

### ✅ Vales de Combustible
- [x] Emisión con numeración automática
- [x] **Notificaciones de vales registrados**
- [x] Control de estados
- [x] Cálculos automáticos

### ✅ Sistema de Notificaciones
- [x] **Notificaciones push locales**
- [x] **Configuración personalizable**
- [x] **Alertas automáticas de eventos**
- [x] **Panel de administración completo**

## 🔄 Próximas Funcionalidades

- [x] ~~**Generación de comprobantes PDF**~~ ✅ **Implementado**
- [x] ~~**Scanner de placas y QR**~~ ✅ **Implementado**
- [x] ~~**Validación de formatos guatemaltecos**~~ ✅ **Implementado**
- [ ] **Modo offline** con sincronización
- [ ] **Geolocalización** de camiones en tiempo real
- [ ] **Push notifications remotas** desde servidor
- [ ] **Autenticación** de usuarios
- [ ] **Roles y permisos** diferenciados
- [ ] **Dashboard** en tiempo real
- [ ] **Backup automático** de datos
- [ ] **Impresión física** de comprobantes
- [ ] **Reportes avanzados** con gráficos
- [ ] **Integración con GPS** para tracking

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

Para soporte técnico o consultas sobre el proyecto, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para Transportes Ultrarrápidos**
**✨ Ahora con Scanner Optimizado 🔍, Generador QR 📱 y Comprobantes PDF 📄 ✨**
