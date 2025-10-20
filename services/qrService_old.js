class QRService {
  constructor() {
    this.qrPrefix = 'CAMION_QR:';
  }

  // Generar datos QR para un camión
  generateCamionQRData(camion, piloto = null) {
    const qrData = {
      placa: camion.placa,
      marca: camion.marca,
      modelo: camion.modelo,
      año: camion.año,
      piloto: piloto || camion.piloto || null,
      fechaGeneracion: new Date().toISOString(),
      tipo: 'camion'
    };

    return this.qrPrefix + JSON.stringify(qrData);
  }

  // Validar si un código QR es de camión
  isCamionQR(qrData) {
    return qrData && qrData.startsWith(this.qrPrefix);
  }

  // Extraer datos de un código QR de camión
  parseCamionQR(qrData) {
    try {
      if (!this.isCamionQR(qrData)) {
        throw new Error('No es un código QR de camión válido');
      }

      const jsonData = qrData.replace(this.qrPrefix, '');
      const camionData = JSON.parse(jsonData);

      // Validar estructura básica
      if (!camionData.placa || !camionData.tipo) {
        throw new Error('Código QR de camión incompleto');
      }

      return camionData;
    } catch (error) {
      throw new Error('Error al procesar código QR: ' + error.message);
    }
  }

  // Validar formato de placa guatemalteca
  validateGuatemalanPlate(placa) {
    // Formatos válidos para Guatemala:
    // P-001AAA (Particular)
    // C-001AAA (Comercial)
    // M-001AAA (Motocicleta)
    // A-001AAA (Agrícola)
    // TC-001AAA (Transporte Colectivo)
    
    const patterns = [
      /^P-\d{3}[A-Z]{3}$/,     // Particular
      /^C-\d{3}[A-Z]{3}$/,     // Comercial
      /^M-\d{3}[A-Z]{3}$/,     // Motocicleta
      /^A-\d{3}[A-Z]{3}$/,     // Agrícola
      /^TC-\d{3}[A-Z]{3}$/,    // Transporte Colectivo
      /^O-\d{3}[A-Z]{3}$/,     // Oficial
      /^CD-\d{3}[A-Z]{3}$/,    // Cuerpo Diplomático
    ];

    return patterns.some(pattern => pattern.test(placa.toUpperCase()));
  }

  // Limpiar y formatear placa
  formatPlate(placa) {
    if (!placa) return '';
    
    // Convertir a mayúsculas y limpiar espacios
    let formatted = placa.toUpperCase().trim();
    
    // Agregar guión si no lo tiene (para formatos como P001AAA -> P-001AAA)
    if (formatted.length >= 6 && !formatted.includes('-')) {
      // Detectar patrón y agregar guión
      if (/^[A-Z]{1,2}\d{3}[A-Z]{3}$/.test(formatted)) {
        const letters = formatted.match(/^[A-Z]{1,2}/)[0];
        const rest = formatted.substring(letters.length);
        formatted = `${letters}-${rest}`;
      }
    }
    
    return formatted;
  }

  // Generar URL para código QR (para usar con librerías externas)
  generateQRUrl(camion, piloto = null) {
    const qrData = this.generateCamionQRData(camion, piloto);
    // Codificar para URL
    return encodeURIComponent(qrData);
  }

  // Generar información legible del QR
  generateQRInfo(camion, piloto = null) {
    return {
      titulo: `QR - ${camion.placa}`,
      subtitulo: `${camion.marca} ${camion.modelo}`,
      detalles: [
        `Placa: ${camion.placa}`,
        `Marca: ${camion.marca}`,
        `Modelo: ${camion.modelo}`,
        `Año: ${camion.año}`,
        `Piloto: ${piloto || camion.piloto || 'No asignado'}`,
        `Estado: ${camion.estado}`,
        `Generado: ${new Date().toLocaleString()}`
      ]
    };
  }

  // Buscar camión por placa en una lista
  findCamionByPlate(camiones, placa) {
    if (!placa || !camiones) return null;
    
    const placaFormateada = this.formatPlate(placa);
    
    return camiones.find(camion => 
      camion.placa.toUpperCase() === placaFormateada ||
      camion.placa.toUpperCase() === placa.toUpperCase()
    );
  }

  // Generar sugerencias de placas similares
  getSimilarPlates(camiones, placa) {
    if (!placa || !camiones || placa.length < 2) return [];
    
    const placaLower = placa.toLowerCase();
    
    return camiones
      .filter(camion => 
        camion.placa.toLowerCase().includes(placaLower) ||
        camion.placa.toLowerCase().startsWith(placaLower.substring(0, 3))
      )
      .slice(0, 5) // Máximo 5 sugerencias
      .map(camion => ({
        placa: camion.placa,
        descripcion: `${camion.marca} ${camion.modelo} (${camion.año})`
      }));
  },

  // Validar datos de escaneo
  validateScanData: (data) => {
    if (!data || typeof data !== 'string') {
      return { valid: false, error: 'Datos inválidos o vacíos' };
    }

    const cleanData = data.trim();

    // Verificar si es un código QR
    if (cleanData.startsWith('CAMION_QR:')) {
      try {
        const jsonData = cleanData.replace('CAMION_QR:', '');
        const qrData = JSON.parse(jsonData);
        
        // Validación más estricta del QR
        if (!qrData.placa) {
          return { valid: false, error: 'Código QR sin placa válida' };
        }
        
        if (!qrData.marca && !qrData.modelo) {
          return { valid: false, error: 'Código QR sin información del vehículo' };
        }
        
        return { 
          valid: true, 
          type: 'qr', 
          data: qrData,
          placa: qrData.placa 
        };
      } catch (error) {
        return { valid: false, error: 'Código QR con formato JSON inválido' };
      }
    }

    // Verificar si es una placa guatemalteca
    const plateValidation = qrService.validateGuatemalanPlate(cleanData);
    if (plateValidation.valid) {
      return { 
        valid: true, 
        type: 'plate', 
        placa: plateValidation.placa,
        warning: plateValidation.warning
      };
    }

    // Si no es QR ni placa válida, pero tiene contenido, permitir continuar
    if (cleanData.length > 0) {
      return { 
        valid: false, 
        error: `Formato no reconocido: "${cleanData}"\n\nFormatos válidos:\n• Placas: P-001AAA, C-123BBB, TC-456CCC\n• QR: CAMION_QR:{...}`,
        allowContinue: true
      };
    }

    return { 
      valid: false, 
      error: 'Por favor ingresa una placa o código QR válido' 
    };
  }
};

// Exportar instancia singleton
const qrService = new QRService();
export default qrService;
