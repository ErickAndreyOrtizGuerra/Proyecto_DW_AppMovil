import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ordenesService from './services/ordenesService';
import backgroundTasksService from './services/backgroundTasks';

// Importar pantallas
import CamionesScreen from './screens/CamionesScreen';
import CamionDetalleScreen from './screens/CamionDetalleScreen';
import TransportistasScreen from './screens/TransportistasScreen';
import EstadisticasScreen from './screens/EstadisticasScreen';
import IngresoEgresoScreen from './screens/IngresoEgresoScreen';
import ValesCombustibleScreen from './screens/ValesCombustibleScreen';
import ReportesScreen from './screens/ReportesScreen';
import NotificacionesScreen from './screens/NotificacionesScreen';
import OrdenesScreen from './screens/OrdenesScreen';
import QRGeneratorScreen from './screens/QRGeneratorScreen';
import ScannerScreen from './screens/ScannerScreen';
import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigator para Camiones (incluye la pantalla de detalle)
const CamionesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="Camiones" component={CamionesScreen} />
      <Stack.Screen name="CamionDetalle" component={CamionDetalleScreen} />
      <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} />
    </Stack.Navigator>
  );
};

// Stack Navigator para Movimientos (incluye scanner)
const MovimientosStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="MovimientosList" component={IngresoEgresoScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
};

// Stack Navigator para Reportes (incluye notificaciones)
const ReportesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="ReportesList" component={ReportesScreen} />
      <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
    </Stack.Navigator>
  );
};

// Configuración de iconos para las tabs
const getTabBarIcon = (route, focused, color, size) => {
  let iconName;

  switch (route.name) {
    case 'Camiones':
      iconName = focused ? 'car' : 'car-outline';
      break;
    case 'Movimientos':
      iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
      break;
    case 'Combustible':
      iconName = focused ? 'speedometer' : 'speedometer-outline';
      break;
    case 'Transportistas':
      iconName = focused ? 'people' : 'people-outline';
      break;
    case 'Ordenes':
      iconName = focused ? 'document-text' : 'document-text-outline';
      break;
    case 'Reportes':
      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Navegador principal con tabs (para usuarios autenticados)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => 
          getTabBarIcon(route, focused, color, size),
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Camiones" 
        component={CamionesStack}
        options={{
          tabBarLabel: 'Camiones',
        }}
      />
      <Tab.Screen 
        name="Movimientos" 
        component={MovimientosStack}
        options={{
          tabBarLabel: 'Movimientos',
        }}
      />
      <Tab.Screen 
        name="Combustible" 
        component={ValesCombustibleScreen}
        options={{
          tabBarLabel: 'Combustible',
        }}
      />
      <Tab.Screen 
        name="Transportistas" 
        component={TransportistasScreen}
        options={{
          tabBarLabel: 'Transportistas',
        }}
      />
      <Tab.Screen 
        name="Ordenes" 
        component={OrdenesScreen}
        options={{
          tabBarLabel: 'Órdenes',
        }}
      />
      <Tab.Screen 
        name="Reportes" 
        component={ReportesStack}
        options={{
          tabBarLabel: 'Reportes',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador de autenticación
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// Navegador principal de la app
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Inicializar servicios al cargar la app
    const initializeServices = async () => {
      try {
        await ordenesService.initialize();
        backgroundTasksService.start();
        console.log('Servicios inicializados correctamente');
      } catch (error) {
        console.error('Error inicializando servicios:', error);
      }
    };

    initializeServices();

    // Cleanup al desmontar la app
    return () => {
      backgroundTasksService.stop();
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

// Componente principal de la aplicación
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#1E40AF" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
