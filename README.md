# 🚛 Transportes Ultrarrápidos - App Móvil

Una aplicación móvil moderna desarrollada con React Native y Expo para gestionar la flota de camiones y transportistas de Transportes Ultrarrápidos en Guatemala.

## 📱 Características

### 🚚 Gestión de Camiones
- **Lista completa de camiones** con información detallada
- **Filtros avanzados** por estado (activo, mantenimiento, fuera de servicio)
- **Búsqueda inteligente** por placa, marca, modelo, tipo o transportista
- **Vista detallada** de cada camión con toda la información técnica
- **Contacto directo** con el transportista (llamada y email)

### 👥 Directorio de Transportistas
- **Lista de todos los transportistas** (empresas e independientes)
- **Filtros por tipo** (empresa/independiente)
- **Información completa** de contacto y ubicación
- **Acciones rápidas** para llamar o enviar email

### 📊 Estadísticas en Tiempo Real
- **Dashboard completo** con métricas de la flota
- **Gráficos interactivos** de distribución por tipo y marca
- **Indicadores clave** de disponibilidad y estado
- **Análisis visual** de la composición de la flota

### 🚛 Control de Movimientos
- **Registro de ingresos/egresos** de camiones en tiempo real
- **Datos del piloto** y información de ruta (origen/destino)
- **Tipo de carga** y observaciones adicionales
- **Historial completo** de movimientos con filtros

### ⛽ Gestión de Combustible
- **Emisión de vales** de combustible por camión
- **Control automático** de numeración de órdenes
- **Seguimiento de estados** (emitido/usado/cancelado)
- **Estadísticas de consumo** por período y vehículo

### 📊 Reportes Operativos
- **Reportes de ingresos/egresos** mensuales por predio
- **Análisis de vales** de combustible por fecha/camión/piloto
- **Reportes de viajes** con kilómetros recorridos
- **Productividad del personal** y consolidados mensuales

## 🛠 Tecnologías Utilizadas

- **React Native** - Framework de desarrollo móvil
- **Expo** - Plataforma de desarrollo y despliegue
- **React Navigation** - Navegación entre pantallas
- **Expo Linear Gradient** - Gradientes y efectos visuales
- **Vector Icons** - Iconografía moderna
- **API REST** - Consumo de datos en tiempo real

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI instalado globalmente
- Dispositivo móvil con Expo Go o emulador

### Pasos de Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd "Prueba Transporte Api"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   # o
   expo start
   ```

4. **Ejecutar en dispositivo**
   - Escanea el código QR con Expo Go (Android/iOS)
   - O presiona 'a' para Android emulator
   - O presiona 'i' para iOS simulator

## 📡 API Endpoints

La aplicación consume la API de Transportes Ultrarrápidos:

- **Base URL**: `https://transportes-ultrarapidos-api.uc.r.appspot.com/api/`
- **Camiones**: `/camiones` - Lista de 51 camiones
- **Transportistas**: `/transportistas` - Lista de 19 transportistas
- **Estado**: `/test` - Verificación del servicio

## 📁 Estructura del Proyecto

```
Prueba Transporte Api/
├── App.js                      # Componente principal y navegación
├── app.json                    # Configuración de Expo
├── package.json                # Dependencias y scripts
├── babel.config.js             # Configuración de Babel
├── services/
│   └── transporteApi.js        # Servicio para consumir la API
└── screens/
    ├── CamionesScreen.js       # Lista de camiones
    ├── CamionDetalleScreen.js  # Detalles del camión
    ├── TransportistasScreen.js # Lista de transportistas
    ├── EstadisticasScreen.js   # Dashboard de estadísticas
    ├── IngresoEgresoScreen.js  # Control de movimientos
    ├── ValesCombustibleScreen.js # Gestión de combustible
    └── ReportesScreen.js       # Reportes operativos
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: #1E40AF (Azul)
- **Secundario**: #3B82F6 (Azul claro)
- **Éxito**: #10B981 (Verde)
- **Advertencia**: #F59E0B (Amarillo)
- **Error**: #EF4444 (Rojo)
- **Fondo**: #F1F5F9 (Gris claro)

### Características de Diseño
- **Material Design** con elementos modernos
- **Gradientes suaves** para mejor experiencia visual
- **Iconografía consistente** con Ionicons
- **Tipografía clara** y legible
- **Animaciones fluidas** en transiciones
- **Responsive design** para diferentes tamaños de pantalla

## 📊 Datos de la Flota

### Camiones (51 total)
- **Tipos**: Plataforma, Furgón, Refrigerado, Tanque, Carga General
- **Estados**: Activo, Mantenimiento, Fuera de Servicio
- **Capacidades**: 9.75 - 42.00 toneladas
- **Marcas**: Freightliner, Volvo, Mercedes-Benz, Scania, DAF, etc.
- **Años**: 2016-2022

### Transportistas (19 total)
- **7 Empresas** con NIT registrado
- **12 Independientes** sin NIT
- **Ubicaciones**: Principalmente en Guatemala
- **Contacto completo**: Teléfono, email, dirección

## 🔧 Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en web
npm run web
```

## 📱 Funcionalidades por Pantalla

### 🚛 Pantalla de Camiones
- Lista paginada con pull-to-refresh
- Búsqueda en tiempo real
- Filtros por estado
- Cards con información resumida
- Navegación a detalles

### 🔍 Detalle de Camión
- Información completa del vehículo
- Datos del transportista
- Botones de acción (llamar/email)
- Información técnica y fechas

### 👥 Pantalla de Transportistas
- Lista con filtros por tipo
- Búsqueda por múltiples campos
- Cards diferenciadas por tipo
- Acciones directas de contacto

### 📊 Pantalla de Estadísticas
- Métricas generales de la flota
- Gráficos de barras interactivos
- Distribución por tipos y marcas
- Indicadores de disponibilidad

### 🚛 Pantalla de Movimientos
- Registro de ingresos y egresos
- Formularios con validación
- Selección rápida de camiones
- Historial de movimientos recientes

### ⛽ Pantalla de Combustible
- Emisión de vales automática
- Control de numeración
- Estados de vales (emitido/usado)
- Estadísticas de consumo

### 📊 Pantalla de Reportes
- Reportes operativos diversos
- Métricas de productividad
- Información del sistema móvil
- Funcionalidades de seguridad

## 🌟 Características Destacadas

- **Offline-first**: Manejo de errores de conectividad
- **Performance optimizada**: Lazy loading y optimizaciones
- **Accesibilidad**: Soporte para lectores de pantalla
- **Responsive**: Adaptable a diferentes dispositivos
- **Intuitive UX**: Navegación clara y consistente

## 🐛 Solución de Problemas

### Error de conexión a la API
- Verificar conexión a internet
- Comprobar que la API esté funcionando: `/api/test`

### Problemas de instalación
```bash
# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problemas con Expo
```bash
# Actualizar Expo CLI
npm install -g @expo/cli@latest

# Limpiar cache de Expo
expo r -c
```

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ para Transportes Ultrarrápidos Guatemala.

---

**¿Necesitas ayuda?** Contacta al equipo de desarrollo para soporte técnico.
