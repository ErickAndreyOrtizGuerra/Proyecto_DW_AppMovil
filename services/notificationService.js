import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Inicializar el servicio de notificaciones
  async initialize() {
    try {
      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('No se obtuvieron permisos para notificaciones');
        return false;
      }

      // Obtener token de Expo Push
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Solo obtener token si estamos en un build de desarrollo
      let token = null;
      try {
        token = await Notifications.getExpoPushTokenAsync();
      } catch (error) {
        console.log('Push token no disponible en Expo Go:', error.message);
      }
      
      this.expoPushToken = token?.data || null;
      if (this.expoPushToken) {
        console.log('Token de notificaciones:', this.expoPushToken);
      }

      // Configurar listeners
      this.setupListeners();
      
      return true;
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
      return false;
    }
  }

  // Configurar listeners para notificaciones
  setupListeners() {
    // Limpiar listeners previos para evitar memory leaks
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    // Listener para notificaciones recibidas mientras la app está abierta
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      this.handleNotificationReceived(notification);
    });

    // Listener para cuando el usuario toca una notificación
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  // Manejar notificación recibida
  handleNotificationReceived(notification) {
    const { title, body, data } = notification.request.content;
    
    // Aquí puedes agregar lógica personalizada
    // Por ejemplo, actualizar el estado de la app, mostrar badges, etc.
    
    if (data?.type === 'orden_pendiente') {
      // Lógica específica para órdenes pendientes
      this.handleOrdenPendiente(data);
    } else if (data?.type === 'orden_finalizada') {
      // Lógica específica para órdenes finalizadas
      this.handleOrdenFinalizada(data);
    }
  }

  // Manejar respuesta del usuario a la notificación
  handleNotificationResponse(response) {
    const { notification } = response;
    const { data } = notification.request.content;
    
    // Navegar a la pantalla correspondiente según el tipo de notificación
    if (data?.screen) {
      // Aquí integrarías con tu sistema de navegación
      // navigation.navigate(data.screen, data.params);
    }
  }

  // Enviar notificación local inmediata
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Inmediata
      });
      return true;
    } catch (error) {
      console.error('Error enviando notificación local:', error);
      return false;
    }
  }

  // Programar notificación para más tarde
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const trigger = new Date(triggerDate);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger,
      });
      return true;
    } catch (error) {
      console.error('Error programando notificación:', error);
      return false;
    }
  }

  // Notificaciones específicas del dominio de transportes

  // Notificar nueva orden pendiente
  async notifyOrdenPendiente(orden) {
    if (!orden || !orden.id) {
      console.warn('Orden inválida para notificación');
      return false;
    }

    const placa = orden.placa || 'Sin placa';
    const destino = orden.destino || 'Sin destino';
    const title = '🚛 Nueva Orden Pendiente';
    const body = `Camión ${placa} - ${destino}`;
    const data = {
      type: 'orden_pendiente',
      ordenId: orden.id,
      screen: 'OrdenDetalle',
      params: { ordenId: orden.id }
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Notificar orden finalizada
  async notifyOrdenFinalizada(orden) {
    if (!orden || !orden.id) {
      console.warn('Orden inválida para notificación');
      return false;
    }

    const placa = orden.placa || 'Sin placa';
    const destino = orden.destino || 'Sin destino';
    const title = '✅ Orden Finalizada';
    const body = `Camión ${placa} completó el viaje a ${destino}`;
    const data = {
      type: 'orden_finalizada',
      ordenId: orden.id,
      screen: 'OrdenDetalle',
      params: { ordenId: orden.id }
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Notificar ingreso de camión
  async notifyIngresoRegistrado(movimiento) {
    if (!movimiento || !movimiento.placa) {
      console.warn('Movimiento inválido para notificación');
      return false;
    }

    const title = '📥 Ingreso Registrado';
    const body = `Camión ${movimiento.placa} ingresó al predio`;
    const data = {
      type: 'ingreso_registrado',
      movimientoId: movimiento.id || Date.now(),
      screen: 'IngresoEgreso'
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Notificar egreso de camión
  async notifyEgresoRegistrado(movimiento) {
    if (!movimiento || !movimiento.placa) {
      console.warn('Movimiento inválido para notificación');
      return false;
    }

    const title = '📤 Egreso Registrado';
    const body = `Camión ${movimiento.placa} salió del predio`;
    const data = {
      type: 'egreso_registrado',
      movimientoId: movimiento.id || Date.now(),
      screen: 'IngresoEgreso'
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Notificar vale de combustible registrado
  async notifyValeRegistrado(vale) {
    if (!vale || !vale.id) {
      console.warn('Vale inválido para notificación');
      return false;
    }

    const placa = vale.placa || 'Sin placa';
    const total = vale.total || 0;
    const title = '⛽ Vale de Combustible';
    const body = `Registrado Q${total.toFixed(2)} para ${placa}`;
    const data = {
      type: 'vale_registrado',
      valeId: vale.id,
      screen: 'ValesCombustible'
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Recordatorio de mantenimiento
  async notifyMantenimientoPendiente(camion) {
    if (!camion || !camion.id) {
      console.warn('Camión inválido para notificación');
      return false;
    }

    const placa = camion.placa || 'Sin placa';
    const title = '🔧 Mantenimiento Pendiente';
    const body = `Camión ${placa} requiere mantenimiento`;
    const data = {
      type: 'mantenimiento_pendiente',
      camionId: camion.id,
      screen: 'CamionDetalle',
      params: { camion }
    };

    return await this.sendLocalNotification(title, body, data);
  }

  // Manejar lógica específica de órdenes pendientes
  handleOrdenPendiente(data) {
    // Aquí puedes agregar lógica como:
    // - Actualizar contador de órdenes pendientes
    // - Mostrar badge en el ícono de la app
    // - Actualizar estado global de la app
    console.log('Manejando orden pendiente:', data);
  }

  // Manejar lógica específica de órdenes finalizadas
  handleOrdenFinalizada(data) {
    // Aquí puedes agregar lógica como:
    // - Actualizar estadísticas
    // - Remover de lista de pendientes
    // - Actualizar estado global
    console.log('Manejando orden finalizada:', data);
  }

  // Cancelar todas las notificaciones programadas
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
      return false;
    }
  }

  // Obtener notificaciones programadas
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error obteniendo notificaciones programadas:', error);
      return [];
    }
  }

  // Limpiar listeners al cerrar la app
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Obtener token para push notifications remotas
  getExpoPushToken() {
    return this.expoPushToken;
  }
}

// Exportar instancia singleton
const notificationService = new NotificationService();
export default notificationService;
