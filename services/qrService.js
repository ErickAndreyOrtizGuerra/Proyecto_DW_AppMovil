class QRService {
  constructor() {
    this.qrHistory = [];
  }

  // Generar código QR para un camión
  generateCamionQR(camionData) {
    const qrData = {
      placa: camionData.placa,
      marca: camionData.marca,
      modelo: camionData.modelo,
      año: camionData.año,
      piloto: camionData.piloto || null,
      fechaGeneracion: new Date().toISOString(),
      tipo: 'camion'
    };

    const qrString = `CAMION_QR:${JSON.stringify(qrData)}`;
    
    // Guardar en historial
    this.qrHistory.push({
      id: Date.now(),
      placa: camionData.placa,
      qrString,
      fechaGeneracion: qrData.fechaGeneracion
    });

    return qrString;
  }

  // Validar formato de placa guatemalteca
  validateGuatemalanPlate(placa) {
    if (!placa || typeof placa !== 'string') {
      return { valid: false, error: 'Placa inválida' };
    }

    const cleanPlaca = placa.trim().toUpperCase();
    
    // Patrones de placas guatemaltecas
    const patterns = [
      /^P-\d{3}[A-Z]{3}$/,     // Particular: P-001AAA
      /^C-\d{3}[A-Z]{3}$/,     // Comercial: C-123BBB
      /^TC-\d{3}[A-Z]{3}$/,    // Transporte Colectivo: TC-456CCC
      /^M-\d{3}[A-Z]{3}$/,     // Motocicleta: M-789DDD
      /^A-\d{3}[A-Z]{3}$/,     // Agrícola: A-012EEE
      /^O-\d{3}[A-Z]{3}$/,     // Oficial: O-345FFF
      /^CD-\d{3}[A-Z]{3}$/,    // Cuerpo Diplomático: CD-678GGG
      /^CC-\d{3}[A-Z]{3}$/     // Cuerpo Consular: CC-901HHH
    ];

    const isValid = patterns.some(pattern => pattern.test(cleanPlaca));
    
    if (isValid) {
      let warning = null;
      
      // Verificar si es un formato menos común
      if (cleanPlaca.startsWith('A-') || cleanPlaca.startsWith('O-') || 
          cleanPlaca.startsWith('CD-') || cleanPlaca.startsWith('CC-')) {
        warning = 'Formato de placa especial detectado';
      }
      
      return { 
        valid: true, 
        placa: cleanPlaca,
        warning
      };
    }

    // Sugerir formato correcto
    let suggestion = '';
    if (cleanPlaca.length > 0) {
      if (cleanPlaca.includes('-')) {
        suggestion = 'Verifique el formato: P-001AAA, C-123BBB, TC-456CCC';
      } else {
        suggestion = 'Agregue guión: P-001AAA (no P001AAA)';
      }
    }

    return { 
      valid: false, 
      error: `Formato de placa inválido: ${cleanPlaca}`,
      suggestion
    };
  }

  // Parsear código QR
  parseQRCode(qrString) {
    try {
      if (!qrString.startsWith('CAMION_QR:')) {
        throw new Error('No es un código QR de camión válido');
      }

      const jsonData = qrString.replace('CAMION_QR:', '');
      const data = JSON.parse(jsonData);

      // Validar campos requeridos
      if (!data.placa || !data.marca || !data.modelo) {
        throw new Error('Código QR incompleto');
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener historial de QR generados
  getQRHistory() {
    return this.qrHistory.slice(-10); // Últimos 10
  }

  // Limpiar historial
  clearHistory() {
    this.qrHistory = [];
  }

  // Buscar camiones por placa parcial
  searchCamionesByPlate(placaParcial, camiones = []) {
    if (!placaParcial || placaParcial.length < 2) {
      return [];
    }

    const placaLower = placaParcial.toLowerCase();
    
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
  }

  // Validar datos de escaneo
  validateScanData(data) {
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
    const plateValidation = this.validateGuatemalanPlate(cleanData);
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
}

// Exportar instancia singleton
const qrService = new QRService();
export default qrService;
