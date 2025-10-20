import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notificationService';

class OrdenesService {
  constructor() {
    this.STORAGE_KEY = 'ordenes_trabajo';
    this.ordenes = [];
  }

  // Inicializar servicio con datos de ejemplo
  async initialize() {
    try {
      const ordenesGuardadas = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (ordenesGuardadas) {
        this.ordenes = JSON.parse(ordenesGuardadas);
      } else {
        // Crear órdenes de ejemplo
        await this.crearOrdenesEjemplo();
      }
      return true;
    } catch (error) {
      console.error('Error inicializando órdenes:', error);
      return false;
    }
  }

  // Crear órdenes de ejemplo para demostración
  async crearOrdenesEjemplo() {
    const ordenesEjemplo = [
      {
        id: 'ORD-001',
        titulo: 'Transporte de Contenedores',
        descripcion: 'Transporte de 2 contenedores desde Puerto Quetzal a Ciudad de Guatemala',
        camionAsignado: 'P-001AAA',
        piloto: 'Juan Carlos Méndez',
        origen: 'Puerto Quetzal, Escuintla',
        destino: 'Zona 12, Ciudad de Guatemala',
        fechaCreacion: new Date().toISOString(),
        fechaVencimiento: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        estado: 'pendiente', // pendiente, en_proceso, finalizada, cancelada
        prioridad: 'alta', // baja, media, alta, urgente
        cliente: 'Transportes Marítimos S.A.',
        observaciones: 'Carga frágil, manejar con cuidado',
        kilometrosEstimados: 120,
        tiempoEstimado: '3 horas',
        costo: 2500.00
      },
      {
        id: 'ORD-002',
        titulo: 'Entrega de Materiales de Construcción',
        descripcion: 'Entrega de cemento y varillas a obra en construcción',
        camionAsignado: 'P-002BBB',
        piloto: 'María Elena Rodríguez',
        origen: 'Bodega Central, Mixco',
        destino: 'Proyecto Residencial Las Flores, Villa Nueva',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        fechaVencimiento: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 horas
        estado: 'en_proceso',
        prioridad: 'media',
        cliente: 'Constructora Moderna Ltda.',
        observaciones: 'Coordinar con supervisor de obra al llegar',
        kilometrosEstimados: 45,
        tiempoEstimado: '2 horas',
        costo: 1800.00
      },
      {
        id: 'ORD-003',
        titulo: 'Transporte de Maquinaria Pesada',
        descripcion: 'Traslado de excavadora desde taller a sitio de trabajo',
        camionAsignado: 'P-003CCC',
        piloto: 'Carlos Alberto Morales',
        origen: 'Taller Mecánico Industrial, Zona 21',
        destino: 'Proyecto Carretera CA-1, Chimaltenango',
        fechaCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
        fechaVencimiento: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Vencida hace 2 horas
        estado: 'finalizada',
        prioridad: 'alta',
        cliente: 'Ministerio de Comunicaciones',
        observaciones: 'Requiere escolta policial para maquinaria pesada',
        kilometrosEstimados: 85,
        tiempoEstimado: '4 horas',
        costo: 3200.00
      },
      {
        id: 'ORD-004',
        titulo: 'Distribución de Productos Alimenticios',
        descripcion: 'Entrega de productos perecederos a supermercados',
        camionAsignado: 'P-004DDD',
        piloto: 'Ana Lucía Hernández',
        origen: 'Centro de Distribución, Zona 18',
        destino: 'Múltiples ubicaciones en Zona 10 y 14',
        fechaCreacion: new Date().toISOString(),
        fechaVencimiento: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas
        estado: 'pendiente',
        prioridad: 'urgente',
        cliente: 'Cadena de Supermercados La Despensa',
        observaciones: 'Productos refrigerados, mantener cadena de frío',
        kilometrosEstimados: 65,
        tiempoEstimado: '5 horas',
        costo: 2100.00
      },
      {
        id: 'ORD-005',
        titulo: 'Recolección de Desechos Industriales',
        descripcion: 'Recolección y transporte de desechos a planta de tratamiento',
        camionAsignado: 'P-005EEE',
        piloto: 'Roberto Castillo',
        origen: 'Fábrica Textil San Miguel, Amatitlán',
        destino: 'Planta de Tratamiento, Villa Canales',
        fechaCreacion: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
        fechaVencimiento: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 horas
        estado: 'pendiente',
        prioridad: 'media',
        cliente: 'Industrias Textiles Guatemaltecas',
        observaciones: 'Requiere documentación especial para desechos',
        kilometrosEstimados: 35,
        tiempoEstimado: '2.5 horas',
        costo: 1500.00
      }
    ];

    this.ordenes = ordenesEjemplo;
    await this.guardarOrdenes();
    
    // Programar notificaciones para órdenes pendientes
    await this.programarNotificacionesOrdenesPendientes();
  }

  // Guardar órdenes en AsyncStorage
  async guardarOrdenes() {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.ordenes));
      return true;
    } catch (error) {
      console.error('Error guardando órdenes:', error);
      return false;
    }
  }

  // Obtener todas las órdenes
  async getOrdenes() {
    return this.ordenes;
  }

  // Obtener órdenes por estado
  async getOrdenesPorEstado(estado) {
    return this.ordenes.filter(orden => orden.estado === estado);
  }

  // Obtener órdenes pendientes
  async getOrdenesPendientes() {
    return await this.getOrdenesPorEstado('pendiente');
  }

  // Obtener órdenes finalizadas
  async getOrdenesFinalizadas() {
    return await this.getOrdenesPorEstado('finalizada');
  }

  // Obtener órdenes vencidas
  async getOrdenesVencidas() {
    const ahora = new Date();
    return this.ordenes.filter(orden => 
      orden.estado === 'pendiente' && 
      new Date(orden.fechaVencimiento) < ahora
    );
  }

  // Crear nueva orden
  async crearOrden(datosOrden) {
    const nuevaOrden = {
      id: `ORD-${String(this.ordenes.length + 1).padStart(3, '0')}`,
      ...datosOrden,
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente'
    };

    this.ordenes.unshift(nuevaOrden);
    await this.guardarOrdenes();

    // Notificar nueva orden pendiente
    await notificationService.notifyOrdenPendiente(nuevaOrden);

    return nuevaOrden;
  }

  // Actualizar estado de orden
  async actualizarEstadoOrden(ordenId, nuevoEstado, observaciones = '') {
    const ordenIndex = this.ordenes.findIndex(orden => orden.id === ordenId);
    
    if (ordenIndex === -1) {
      throw new Error('Orden no encontrada');
    }

    const estadoAnterior = this.ordenes[ordenIndex].estado;
    this.ordenes[ordenIndex].estado = nuevoEstado;
    this.ordenes[ordenIndex].fechaActualizacion = new Date().toISOString();
    
    if (observaciones) {
      this.ordenes[ordenIndex].observaciones += `\n[${new Date().toLocaleString()}] ${observaciones}`;
    }

    await this.guardarOrdenes();

    // Notificar cambio de estado
    if (nuevoEstado === 'finalizada' && estadoAnterior !== 'finalizada') {
      await notificationService.notifyOrdenFinalizada(this.ordenes[ordenIndex]);
    }

    return this.ordenes[ordenIndex];
  }

  // Finalizar orden
  async finalizarOrden(ordenId, observacionesFinal = '') {
    return await this.actualizarEstadoOrden(ordenId, 'finalizada', observacionesFinal);
  }

  // Cancelar orden
  async cancelarOrden(ordenId, motivo = '') {
    return await this.actualizarEstadoOrden(ordenId, 'cancelada', `Cancelada: ${motivo}`);
  }

  // Programar notificaciones para órdenes pendientes
  async programarNotificacionesOrdenesPendientes() {
    const ordenesPendientes = await this.getOrdenesPendientes();
    
    for (const orden of ordenesPendientes) {
      const fechaVencimiento = new Date(orden.fechaVencimiento);
      const ahora = new Date();
      
      // Notificar 1 hora antes del vencimiento
      const tiempoNotificacion = fechaVencimiento.getTime() - (60 * 60 * 1000);
      
      if (tiempoNotificacion > ahora.getTime()) {
        await notificationService.scheduleNotification(
          '⏰ Orden próxima a vencer',
          `La orden ${orden.id} vence en 1 hora: ${orden.titulo}`,
          new Date(tiempoNotificacion),
          {
            type: 'orden_vencimiento_proximo',
            ordenId: orden.id,
            screen: 'OrdenDetalle',
            params: { orden }
          }
        );
      }
    }
  }

  // Verificar órdenes vencidas y notificar
  async verificarOrdenesVencidas() {
    const ordenesVencidas = await this.getOrdenesVencidas();
    
    for (const orden of ordenesVencidas) {
      await notificationService.sendLocalNotification(
        '🚨 Orden Vencida',
        `La orden ${orden.id} ha vencido: ${orden.titulo}`,
        {
          type: 'orden_vencida',
          ordenId: orden.id,
          screen: 'OrdenDetalle',
          params: { orden }
        }
      );
    }
    
    return ordenesVencidas;
  }

  // Obtener estadísticas de órdenes
  async getEstadisticas() {
    const total = this.ordenes.length;
    const pendientes = this.ordenes.filter(o => o.estado === 'pendiente').length;
    const enProceso = this.ordenes.filter(o => o.estado === 'en_proceso').length;
    const finalizadas = this.ordenes.filter(o => o.estado === 'finalizada').length;
    const canceladas = this.ordenes.filter(o => o.estado === 'cancelada').length;
    const vencidas = (await this.getOrdenesVencidas()).length;

    return {
      total,
      pendientes,
      enProceso,
      finalizadas,
      canceladas,
      vencidas,
      porcentajeCompletado: total > 0 ? Math.round((finalizadas / total) * 100) : 0
    };
  }

  // Buscar órdenes
  async buscarOrdenes(termino) {
    const terminoLower = termino.toLowerCase();
    return this.ordenes.filter(orden =>
      orden.id.toLowerCase().includes(terminoLower) ||
      orden.titulo.toLowerCase().includes(terminoLower) ||
      orden.cliente.toLowerCase().includes(terminoLower) ||
      orden.piloto.toLowerCase().includes(terminoLower) ||
      orden.camionAsignado.toLowerCase().includes(terminoLower)
    );
  }
}

// Exportar instancia singleton
const ordenesService = new OrdenesService();
export default ordenesService;
