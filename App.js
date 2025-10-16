import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Importar pantallas
import CamionesScreen from './screens/CamionesScreen';
import CamionDetalleScreen from './screens/CamionDetalleScreen';
import TransportistasScreen from './screens/TransportistasScreen';
import EstadisticasScreen from './screens/EstadisticasScreen';
import IngresoEgresoScreen from './screens/IngresoEgresoScreen';
import ValesCombustibleScreen from './screens/ValesCombustibleScreen';
import ReportesScreen from './screens/ReportesScreen';

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
      <Stack.Screen name="CamionesList" component={CamionesScreen} />
      <Stack.Screen name="CamionDetalle" component={CamionDetalleScreen} />
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
    case 'Reportes':
      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      break;
    default:
      iconName = 'help-outline';
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Componente principal de la aplicación
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1E40AF" />
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
          component={IngresoEgresoScreen}
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
          name="Reportes" 
          component={ReportesScreen}
          options={{
            tabBarLabel: 'Reportes',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
