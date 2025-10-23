import ordenesService from './ordenesService';
import notificationService from './notificationService';

class BackgroundTasksService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // Iniciar tareas en segundo plano
  start() {
    // Detener cualquier instancia previa para evitar memory leaks
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;

    // Verificar órdenes cada 30 minutos
    this.intervalId = setInterval(async () => {
      await this.verificarOrdenesVencidas();
      await this.verificarOrdenesPorVencer();
    }, 30 * 60 * 1000); // 30 minutos

    console.log('Tareas en segundo plano iniciadas');
  }

  // Detener tareas en segundo plano
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Tareas en segundo plano detenidas');
  }

  // Verificar órdenes vencidas
  async verificarOrdenesVencidas() {
    try {
      const ordenesVencidas = await ordenesService.getOrdenesVencidas();
      
      for (const orden of ordenesVencidas) {
        await notificationService.sendLocalNotification(
          '🚨 Orden Vencida',
          `La orden ${orden.id} ha vencido: ${orden.titulo}`,
          {
            type: 'orden_vencida',
            ordenId: orden.id,
            prioridad: orden.prioridad
          }
        );
      }

      if (ordenesVencidas.length > 0) {
        console.log(`Se encontraron ${ordenesVencidas.length} órdenes vencidas`);
      }
    } catch (error) {
      console.error('Error verificando órdenes vencidas:', error);
    }
  }

  // Verificar órdenes que están por vencer (próximas 2 horas)
  async verificarOrdenesPorVencer() {
    try {
      const ordenes = await ordenesService.getOrdenesPendientes();
      const ahora = new Date();
      const dosHorasEnMs = 2 * 60 * 60 * 1000;

      const ordenesPorVencer = ordenes.filter(orden => {
        const fechaVencimiento = new Date(orden.fechaVencimiento);
        const tiempoRestante = fechaVencimiento.getTime() - ahora.getTime();
        return tiempoRestante > 0 && tiempoRestante <= dosHorasEnMs;
      });

      for (const orden of ordenesPorVencer) {
        const fechaVencimiento = new Date(orden.fechaVencimiento);
        const horasRestantes = Math.ceil((fechaVencimiento.getTime() - ahora.getTime()) / (60 * 60 * 1000));
        
        await notificationService.sendLocalNotification(
          '⏰ Orden por Vencer',
          `La orden ${orden.id} vence en ${horasRestantes} hora(s): ${orden.titulo}`,
          {
            type: 'orden_por_vencer',
            ordenId: orden.id,
            horasRestantes,
            prioridad: orden.prioridad
          }
        );
      }

      if (ordenesPorVencer.length > 0) {
        console.log(`Se encontraron ${ordenesPorVencer.length} órdenes por vencer`);
      }
    } catch (error) {
      console.error('Error verificando órdenes por vencer:', error);
    }
  }

  // Generar notificaciones de resumen diario
  async generarResumenDiario() {
    try {
      const estadisticas = await ordenesService.getEstadisticas();
      
      await notificationService.sendLocalNotification(
        '📊 Resumen Diario',
        `Órdenes: ${estadisticas.pendientes} pendientes, ${estadisticas.finalizadas} finalizadas hoy`,
        {
          type: 'resumen_diario',
          estadisticas
        }
      );
    } catch (error) {
      console.error('Error generando resumen diario:', error);
    }
  }

  // Verificar órdenes de alta prioridad sin asignar
  async verificarOrdenesAltaPrioridad() {
    try {
      const ordenes = await ordenesService.getOrdenesPendientes();
      const ordenesUrgentes = ordenes.filter(orden => 
        orden.prioridad === 'urgente' || orden.prioridad === 'alta'
      );

      for (const orden of ordenesUrgentes) {
        const tiempoCreacion = new Date() - new Date(orden.fechaCreacion);
        const minutosDesdeCreacion = tiempoCreacion / (1000 * 60);

        // Notificar si una orden urgente lleva más de 15 minutos sin procesar
        if (minutosDesdeCreacion > 15) {
          await notificationService.sendLocalNotification(
            '🔥 Orden Urgente Pendiente',
            `Orden ${orden.id} de prioridad ${orden.prioridad} requiere atención inmediata`,
            {
              type: 'orden_urgente_pendiente',
              ordenId: orden.id,
              prioridad: orden.prioridad,
              minutosEspera: Math.round(minutosDesdeCreacion)
            }
          );
        }
      }
    } catch (error) {
      console.error('Error verificando órdenes de alta prioridad:', error);
    }
  }

  // Ejecutar verificación manual
  async ejecutarVerificacionManual() {
    console.log('Ejecutando verificación manual de órdenes...');
    await this.verificarOrdenesVencidas();
    await this.verificarOrdenesPorVencer();
    await this.verificarOrdenesAltaPrioridad();
    console.log('Verificación manual completada');
  }
}

// Exportar instancia singleton
const backgroundTasksService = new BackgroundTasksService();
export default backgroundTasksService;
