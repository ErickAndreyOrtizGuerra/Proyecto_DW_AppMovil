const API_BASE_URL = 'https://transportes-ultrarapidos-api.uc.r.appspot.com/api';

/**
 * Servicio para consumir la API de Transportes Ultrarrápidos
 */
class TransporteApiService {
  constructor() {
    // Sistema de caché con TTL (Time To Live)
    this.cache = {
      camiones: { data: null, timestamp: null, ttl: 5 * 60 * 1000 }, // 5 minutos
      transportistas: { data: null, timestamp: null, ttl: 10 * 60 * 1000 } // 10 minutos
    };
  }

  /**
   * Verifica si los datos en caché son válidos
   */
  isCacheValid(cacheKey) {
    const cached = this.cache[cacheKey];
    if (!cached.data || !cached.timestamp) {
      return false;
    }
    const now = Date.now();
    return (now - cached.timestamp) < cached.ttl;
  }

  /**
   * Invalida el caché para forzar nueva carga
   */
  invalidateCache(cacheKey = null) {
    if (cacheKey) {
      this.cache[cacheKey] = { data: null, timestamp: null, ttl: this.cache[cacheKey].ttl };
    } else {
      // Invalida todo el caché
      Object.keys(this.cache).forEach(key => {
        this.cache[key].data = null;
        this.cache[key].timestamp = null;
      });
    }
  }

  /**
   * Método genérico para hacer peticiones HTTP
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
   * Obtiene el estado de la API
   */
  async getApiStatus() {
    return await this.fetchData('/test');
  }

  /**
   * Obtiene todos los camiones (con caché)
   */
  async getCamiones(forceRefresh = false) {
    if (!forceRefresh && this.isCacheValid('camiones')) {
      return this.cache.camiones.data;
    }

    const response = await this.fetchData('/camiones');
    const data = Array.isArray(response.data) ? response.data : [];

    // Actualizar caché
    this.cache.camiones.data = data;
    this.cache.camiones.timestamp = Date.now();

    return data;
  }

  /**
   * Obtiene todos los transportistas (con caché)
   */
  async getTransportistas(forceRefresh = false) {
    if (!forceRefresh && this.isCacheValid('transportistas')) {
      return this.cache.transportistas.data;
    }

    const response = await this.fetchData('/transportistas');
    const data = Array.isArray(response.data) ? response.data : [];

    // Actualizar caché
    this.cache.transportistas.data = data;
    this.cache.transportistas.timestamp = Date.now();

    return data;
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
}

// Exportar una instancia única del servicio
export default new TransporteApiService();
