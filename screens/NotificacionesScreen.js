import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';
import backgroundTasksService from '../services/backgroundTasks';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const NotificacionesScreen = ({ navigation }) => {
  const [configuracion, setConfiguracion] = useState({
    ingresoEgreso: true,
    valesCombustible: true,
    ordenesPendientes: true,
    ordenesFinalizadas: true,
    mantenimiento: true,
    sonido: true,
    vibracion: true,
  });

  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    cargarConfiguracion();
    obtenerPushToken();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      const config = await AsyncStorage.getItem('notificaciones_config');
      if (config) {
        setConfiguracion(JSON.parse(config));
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const guardarConfiguracion = async (nuevaConfig) => {
    try {
      await AsyncStorage.setItem('notificaciones_config', JSON.stringify(nuevaConfig));
      setConfiguracion(nuevaConfig);
    } catch (error) {
      console.error('Error guardando configuración:', error);
    }
  };

  const obtenerPushToken = async () => {
    const token = notificationService.getExpoPushToken();
    setPushToken(token);
  };

  const toggleConfiguracion = (key) => {
    const nuevaConfig = {
      ...configuracion,
      [key]: !configuracion[key]
    };
    guardarConfiguracion(nuevaConfig);
  };

  const probarNotificacion = async () => {
    const exito = await notificationService.sendLocalNotification(
      '🧪 Notificación de Prueba',
      'Esta es una notificación de prueba para verificar que todo funciona correctamente.',
      { type: 'test' }
    );

    if (exito) {
      Alert.alert('Éxito', 'Notificación de prueba enviada');
    } else {
      Alert.alert('Error', 'No se pudo enviar la notificación de prueba');
    }
  };

  const limpiarNotificaciones = async () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que quieres cancelar todas las notificaciones programadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            const exito = await notificationService.cancelAllNotifications();
            if (exito) {
              Alert.alert('Éxito', 'Todas las notificaciones han sido canceladas');
            }
          }
        }
      ]
    );
  };

  const verificarOrdenesManualmente = async () => {
    try {
      await backgroundTasksService.ejecutarVerificacionManual();
      Alert.alert('Verificación Completa', 'Se ha verificado el estado de todas las órdenes y se han enviado las notificaciones correspondientes.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo verificar el estado de las órdenes');
    }
  };

  const ConfiguracionItem = ({ title, subtitle, value, onToggle, icon }) => (
    <View style={styles.configItem}>
      <View style={styles.configLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={COLORS.transport.primary} />
        </View>
        <View style={styles.configText}>
          <Text style={styles.configTitle}>{title}</Text>
          {subtitle && <Text style={styles.configSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: COLORS.secondary[300], true: COLORS.transport.primary }}
        thumbColor={value ? COLORS.white : COLORS.secondary[400]}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 Notificaciones</Text>
        <Text style={styles.headerSubtitle}>Configura tus alertas</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Tipos de Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos de Notificaciones</Text>
          
          <ConfiguracionItem
            title="Ingreso y Egreso"
            subtitle="Notificaciones cuando se registran movimientos"
            value={configuracion.ingresoEgreso}
            onToggle={() => toggleConfiguracion('ingresoEgreso')}
            icon="car-outline"
          />

          <ConfiguracionItem
            title="Vales de Combustible"
            subtitle="Alertas sobre vales emitidos y utilizados"
            value={configuracion.valesCombustible}
            onToggle={() => toggleConfiguracion('valesCombustible')}
            icon="car-outline"
          />

          <ConfiguracionItem
            title="Órdenes Pendientes"
            subtitle="Nuevas órdenes de trabajo asignadas"
            value={configuracion.ordenesPendientes}
            onToggle={() => toggleConfiguracion('ordenesPendientes')}
            icon="document-text-outline"
          />

          <ConfiguracionItem
            title="Órdenes Finalizadas"
            subtitle="Confirmación de órdenes completadas"
            value={configuracion.ordenesFinalizadas}
            onToggle={() => toggleConfiguracion('ordenesFinalizadas')}
            icon="checkmark-circle-outline"
          />

          <ConfiguracionItem
            title="Mantenimiento"
            subtitle="Recordatorios de mantenimiento preventivo"
            value={configuracion.mantenimiento}
            onToggle={() => toggleConfiguracion('mantenimiento')}
            icon="construct-outline"
          />
        </View>

        {/* Sección de Configuración de Sonido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Alertas</Text>
          
          <ConfiguracionItem
            title="Sonido"
            subtitle="Reproducir sonido con las notificaciones"
            value={configuracion.sonido}
            onToggle={() => toggleConfiguracion('sonido')}
            icon="volume-high-outline"
          />

          {Platform.OS === 'ios' && (
            <ConfiguracionItem
              title="Vibración"
              subtitle="Vibrar el dispositivo con las notificaciones"
              value={configuracion.vibracion}
              onToggle={() => toggleConfiguracion('vibracion')}
              icon="phone-portrait-outline"
            />
          )}
        </View>

        {/* Sección de Información */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Dispositivo</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="phone-portrait" size={20} color={COLORS.secondary[600]} />
              <Text style={styles.infoLabel}>Plataforma:</Text>
              <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
            </View>
            
            {pushToken && (
              <View style={styles.infoRow}>
                <Ionicons name="key" size={20} color={COLORS.secondary[600]} />
                <Text style={styles.infoLabel}>Token Push:</Text>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {pushToken.substring(0, 20)}...
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.testButton} onPress={probarNotificacion}>
            <Ionicons name="flask" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Probar Notificación</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={limpiarNotificaciones}>
            <Ionicons name="trash" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Limpiar Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkButton} onPress={verificarOrdenesManualmente}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
            <Text style={styles.buttonText}>Verificar Órdenes</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>💡 Consejos</Text>
          <Text style={styles.helpText}>
            • Las notificaciones te mantienen informado sobre eventos importantes{'\n'}
            • Puedes desactivar tipos específicos según tus necesidades{'\n'}
            • Las notificaciones funcionan incluso cuando la app está cerrada{'\n'}
            • Asegúrate de tener los permisos de notificación activados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.lg,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  configText: {
    flex: 1,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.xs,
  },
  configSubtitle: {
    fontSize: 14,
    color: COLORS.secondary[600],
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[600],
    marginLeft: SPACING.sm,
    marginRight: SPACING.sm,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.secondary[800],
    flex: 1,
  },
  actionButtons: {
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  testButton: {
    backgroundColor: COLORS.transport.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  clearButton: {
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  checkButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    marginTop: SPACING.xl,
    marginBottom: SPACING['3xl'],
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.md,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
});

export default NotificacionesScreen;
