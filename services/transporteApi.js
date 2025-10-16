const API_BASE_URL = 'https://transportes-ultrarapidos-api.uc.r.appspot.com/api';

/**
 * Servicio para consumir la API de Transportes Ultrarrápidos
 */
class TransporteApiService {
  
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
}

// Exportar una instancia única del servicio
export default new TransporteApiService();
