const API_BASE_URL = 'https://transportes-ultrarapidos-api.uc.r.appspot.com/api';

/**
 * Servicio para consumir la API de Transportes Ultrarrápidos
 */
class TransporteApiService {
  
  /**
   * Método genérico para hacer peticiones HTTP GET
   */
  async fetchData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para hacer peticiones HTTP POST
   */
  async postData(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error posting data to ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para hacer peticiones HTTP PUT
   */
  async putData(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error updating data at ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Método genérico para hacer peticiones HTTP DELETE
   */
  async deleteData(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error deleting data at ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de la API
   */
  async getApiStatus() {
    return await this.fetchData('/test');
  }

  /**
   * Obtiene todos los camiones
   */
  async getCamiones() {
    const response = await this.fetchData('/camiones');
    return response.data || [];
  }

  /**
   * Obtiene todos los transportistas
   */
  async getTransportistas() {
    const response = await this.fetchData('/transportistas');
    return response.data || [];
  }

  /**
   * Filtra camiones por estado
   */
  async getCamionesPorEstado(estado) {
    const camiones = await this.getCamiones();
    return camiones.filter(camion => camion.estado === estado);
  }

  /**
   * Filtra camiones por tipo
   */
  async getCamionesPorTipo(tipo) {
    const camiones = await this.getCamiones();
    return camiones.filter(camion => camion.tipo === tipo);
  }

  /**
   * Obtiene un camión por ID
   */
  async getCamionById(id) {
    const camiones = await this.getCamiones();
    return camiones.find(camion => camion.id === id);
  }

  /**
   * Obtiene un transportista por ID
   */
  async getTransportistaById(id) {
    const transportistas = await this.getTransportistas();
    return transportistas.find(transportista => transportista.id === id);
  }

  /**
   * Obtiene estadísticas generales
   */
  async getEstadisticas() {
    try {
      const [camiones, transportistas] = await Promise.all([
        this.getCamiones(),
        this.getTransportistas()
      ]);

      const estadisticas = {
        totalCamiones: camiones.length,
        camionesActivos: camiones.filter(c => c.estado === 'activo').length,
        camionesMantenimiento: camiones.filter(c => c.estado === 'mantenimiento').length,
        camionesFueraServicio: camiones.filter(c => c.estado === 'fuera_servicio').length,
        totalTransportistas: transportistas.length,
        empresas: transportistas.filter(t => t.tipo === 'empresa').length,
        independientes: transportistas.filter(t => t.tipo === 'independiente').length,
        tiposCamiones: this.contarPorTipo(camiones),
        marcasCamiones: this.contarPorMarca(camiones)
      };

      return estadisticas;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Cuenta camiones por tipo
   */
  contarPorTipo(camiones) {
    const tipos = {};
    camiones.forEach(camion => {
      tipos[camion.tipo] = (tipos[camion.tipo] || 0) + 1;
    });
    return tipos;
  }

  /**
   * Cuenta camiones por marca
   */
  contarPorMarca(camiones) {
    const marcas = {};
    camiones.forEach(camion => {
      marcas[camion.marca] = (marcas[camion.marca] || 0) + 1;
    });
    return marcas;
  }

  // ========================================
  // MÉTODOS CRUD PARA CAMIONES
  // ========================================

  /**
   * Obtiene un camión específico por ID desde la API
   */
  async getCamion(id) {
    const response = await this.fetchData(`/camiones/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo camión
   */
  async createCamion(camionData) {
    const response = await this.postData('/camiones', camionData);
    return response;
  }

  /**
   * Actualiza un camión existente
   */
  async updateCamion(id, camionData) {
    const response = await this.putData(`/camiones/${id}`, camionData);
    return response;
  }

  /**
   * Elimina un camión
   */
  async deleteCamion(id) {
    const response = await this.deleteData(`/camiones/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA TRANSPORTISTAS
  // ========================================

  /**
   * Obtiene un transportista específico por ID
   */
  async getTransportista(id) {
    const response = await this.fetchData(`/transportistas/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo transportista
   */
  async createTransportista(transportistaData) {
    const response = await this.postData('/transportistas', transportistaData);
    return response;
  }

  /**
   * Actualiza un transportista existente
   */
  async updateTransportista(id, transportistaData) {
    const response = await this.putData(`/transportistas/${id}`, transportistaData);
    return response;
  }

  /**
   * Elimina un transportista
   */
  async deleteTransportista(id) {
    const response = await this.deleteData(`/transportistas/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA PILOTOS
  // ========================================

  /**
   * Obtiene todos los pilotos
   */
  async getPilotos() {
    const response = await this.fetchData('/pilotos');
    return response.data || [];
  }

  /**
   * Obtiene un piloto específico por ID
   */
  async getPiloto(id) {
    const response = await this.fetchData(`/pilotos/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo piloto
   */
  async createPiloto(pilotoData) {
    const response = await this.postData('/pilotos', pilotoData);
    return response;
  }

  /**
   * Actualiza un piloto existente
   */
  async updatePiloto(id, pilotoData) {
    const response = await this.putData(`/pilotos/${id}`, pilotoData);
    return response;
  }

  /**
   * Elimina un piloto
   */
  async deletePiloto(id) {
    const response = await this.deleteData(`/pilotos/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA ÓRDENES DE TRABAJO
  // ========================================

  /**
   * Obtiene todas las órdenes de trabajo
   */
  async getOrdenes() {
    const response = await this.fetchData('/ordenes');
    return response.data || [];
  }

  /**
   * Obtiene una orden específica por ID
   */
  async getOrden(id) {
    const response = await this.fetchData(`/ordenes/${id}`);
    return response.data;
  }

  /**
   * Crea una nueva orden de trabajo
   */
  async createOrden(ordenData) {
    const response = await this.postData('/ordenes', ordenData);
    return response;
  }

  /**
   * Actualiza una orden de trabajo existente
   */
  async updateOrden(id, ordenData) {
    const response = await this.putData(`/ordenes/${id}`, ordenData);
    return response;
  }

  /**
   * Elimina una orden de trabajo
   */
  async deleteOrden(id) {
    const response = await this.deleteData(`/ordenes/${id}`);
    return response;
  }

  /**
   * Registra un ingreso en una orden de trabajo
   * Campos requeridos: origen, tipo_carga, fecha_ingreso
   * Campos opcionales: observaciones
   * NO incluir: camion_id, predio_id, bodega_id, peso_bruto, tara, peso_neto
   */
  async registrarIngreso(ordenId, ingresoData) {
    // Validar estructura según API real
    const validData = {
      origen: ingresoData.origen,
      tipo_carga: ingresoData.tipo_carga,
      fecha_ingreso: ingresoData.fecha_ingreso,
      ...(ingresoData.observaciones && { observaciones: ingresoData.observaciones })
    };
    
    const response = await this.postData(`/ordenes/${ordenId}/ingreso`, validData);
    return response;
  }

  /**
   * Registra un egreso en una orden de trabajo
   * Campos requeridos: destino, tipo_carga, fecha_egreso
   * Campos opcionales: kilometraje, observaciones
   * NO incluir: camion_id, predio_id, bodega_id, peso_bruto, tara, peso_neto
   */
  async registrarEgreso(ordenId, egresoData) {
    // Validar estructura según API real
    const validData = {
      destino: egresoData.destino,
      tipo_carga: egresoData.tipo_carga,
      fecha_egreso: egresoData.fecha_egreso,
      ...(egresoData.kilometraje && { kilometraje: egresoData.kilometraje }),
      ...(egresoData.observaciones && { observaciones: egresoData.observaciones })
    };
    
    const response = await this.postData(`/ordenes/${ordenId}/egreso`, validData);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA VALES DE COMBUSTIBLE
  // ========================================

  /**
   * Obtiene todos los vales de combustible
   */
  async getValesCombustible() {
    const response = await this.fetchData('/vales-combustible');
    return response.data || [];
  }

  /**
   * Obtiene un vale específico por ID
   */
  async getValeCombustible(id) {
    const response = await this.fetchData(`/vales-combustible/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo vale de combustible
   * Campos requeridos: orden_trabajo_id, cantidad_galones, fecha_vale
   * Campos opcionales: precio_galon, total, observaciones
   * IMPORTANTE: Usar "cantidad_galones" NO "galones"
   * NO incluir: camion_id, numero_factura
   */
  async createValeCombustible(valeData) {
    // Validar estructura según API real
    const validData = {
      orden_trabajo_id: valeData.orden_trabajo_id,
      cantidad_galones: valeData.cantidad_galones || valeData.galones, // Compatibilidad
      fecha_vale: valeData.fecha_vale,
      ...(valeData.precio_galon && { precio_galon: valeData.precio_galon }),
      ...(valeData.total && { total: valeData.total }),
      ...(valeData.observaciones && { observaciones: valeData.observaciones })
    };
    
    const response = await this.postData('/vales-combustible', validData);
    return response;
  }

  /**
   * Actualiza un vale de combustible existente
   * Usar "cantidad_galones" NO "galones"
   */
  async updateValeCombustible(id, valeData) {
    // Validar estructura según API real
    const validData = {
      ...(valeData.cantidad_galones && { cantidad_galones: valeData.cantidad_galones }),
      ...(valeData.galones && { cantidad_galones: valeData.galones }), // Compatibilidad
      ...(valeData.precio_galon && { precio_galon: valeData.precio_galon }),
      ...(valeData.total && { total: valeData.total }),
      ...(valeData.fecha_vale && { fecha_vale: valeData.fecha_vale }),
      ...(valeData.observaciones && { observaciones: valeData.observaciones })
    };
    
    const response = await this.putData(`/vales-combustible/${id}`, validData);
    return response;
  }

  /**
   * Elimina un vale de combustible
   */
  async deleteValeCombustible(id) {
    const response = await this.deleteData(`/vales-combustible/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA PREDIOS
  // ========================================

  /**
   * Obtiene todos los predios
   */
  async getPredios() {
    const response = await this.fetchData('/predios');
    return response.data || [];
  }

  /**
   * Obtiene un predio específico por ID
   */
  async getPredio(id) {
    const response = await this.fetchData(`/predios/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo predio
   */
  async createPredio(predioData) {
    const response = await this.postData('/predios', predioData);
    return response;
  }

  /**
   * Actualiza un predio existente
   */
  async updatePredio(id, predioData) {
    const response = await this.putData(`/predios/${id}`, predioData);
    return response;
  }

  /**
   * Elimina un predio
   */
  async deletePredio(id) {
    const response = await this.deleteData(`/predios/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS CRUD PARA BODEGAS
  // ========================================

  /**
   * Obtiene todas las bodegas
   */
  async getBodegas() {
    const response = await this.fetchData('/bodegas');
    return response.data || [];
  }

  /**
   * Obtiene una bodega específica por ID
   */
  async getBodega(id) {
    const response = await this.fetchData(`/bodegas/${id}`);
    return response.data;
  }

  /**
   * Crea una nueva bodega
   */
  async createBodega(bodegaData) {
    const response = await this.postData('/bodegas', bodegaData);
    return response;
  }

  /**
   * Actualiza una bodega existente
   */
  async updateBodega(id, bodegaData) {
    const response = await this.putData(`/bodegas/${id}`, bodegaData);
    return response;
  }

  /**
   * Elimina una bodega
   */
  async deleteBodega(id) {
    const response = await this.deleteData(`/bodegas/${id}`);
    return response;
  }

  // ========================================
  // MÉTODOS DE AUTENTICACIÓN (OPCIONAL)
  // ========================================

  /**
   * Inicia sesión en la API
   */
  async login(email, password) {
    const response = await this.postData('/login', { email, password });
    return response;
  }

  // ========================================
  // MÉTODOS DE UTILIDAD ADICIONALES
  // ========================================

  /**
   * Obtiene estadísticas completas incluyendo nuevas entidades
   */
  async getEstadisticasCompletas() {
    try {
      const [camiones, transportistas, pilotos, ordenes, vales, predios, bodegas] = await Promise.all([
        this.getCamiones(),
        this.getTransportistas(),
        this.getPilotos(),
        this.getOrdenes(),
        this.getValesCombustible(),
        this.getPredios(),
        this.getBodegas()
      ]);

      return {
        // Estadísticas de camiones
        totalCamiones: camiones.length,
        camionesActivos: camiones.filter(c => c.estado === 'activo').length,
        camionesMantenimiento: camiones.filter(c => c.estado === 'mantenimiento').length,
        camionesFueraServicio: camiones.filter(c => c.estado === 'fuera_servicio').length,
        
        // Estadísticas de transportistas
        totalTransportistas: transportistas.length,
        
        // Estadísticas de pilotos
        totalPilotos: pilotos.length,
        pilotosActivos: pilotos.filter(p => p.active).length,
        
        // Estadísticas de órdenes
        totalOrdenes: ordenes.length,
        ordenesPendientes: ordenes.filter(o => o.estado === 'pendiente').length,
        ordenesEnProceso: ordenes.filter(o => o.estado === 'en_proceso').length,
        ordenesCompletadas: ordenes.filter(o => o.estado === 'completada').length,
        
        // Estadísticas de vales
        totalVales: vales.length,
        
        // Estadísticas de predios y bodegas
        totalPredios: predios.length,
        totalBodegas: bodegas.length,
        
        // Análisis por tipo
        tiposCamiones: this.contarPorTipo(camiones),
        marcasCamiones: this.contarPorMarca(camiones)
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas completas:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export default new TransporteApiService();
