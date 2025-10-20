import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

class PDFService {
  constructor() {
    this.companyInfo = {
      name: 'TRANSPORTES ULTRARRÁPIDOS',
      subtitle: 'Servicios de Transporte de Carga',
      phone: '(502) 2234-5678',
      email: 'info@ultrarapidos.com',
      address: 'Ciudad de Guatemala, Guatemala'
    };
  }

  // Generar HTML para el comprobante
  generateComprobanteHTML(movimiento, tipo) {
    const fechaActual = new Date();
    const numeroComprobante = `${tipo.toUpperCase()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Comprobante de ${tipo}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.4;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #fff;
            }
            
            .comprobante {
                border: 2px solid #1E40AF;
                border-radius: 10px;
                padding: 30px;
                background: #fff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                text-align: center;
                border-bottom: 3px solid #1E40AF;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #1E40AF;
                margin-bottom: 5px;
                letter-spacing: 1px;
            }
            
            .company-subtitle {
                font-size: 14px;
                color: #666;
                margin-bottom: 15px;
            }
            
            .comprobante-title {
                font-size: 24px;
                font-weight: bold;
                color: #1E40AF;
                margin: 20px 0 10px 0;
                text-transform: uppercase;
            }
            
            .numero-comprobante {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 20px;
            }
            
            .fecha-hora {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
                border-left: 4px solid #1E40AF;
            }
            
            .fecha-item {
                text-align: center;
            }
            
            .fecha-label {
                font-size: 12px;
                color: #666;
                text-transform: uppercase;
                font-weight: 600;
            }
            
            .fecha-valor {
                font-size: 16px;
                font-weight: bold;
                color: #333;
                margin-top: 5px;
            }
            
            .seccion {
                margin-bottom: 25px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .seccion-header {
                background: #1E40AF;
                color: white;
                padding: 12px 20px;
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .seccion-content {
                padding: 20px;
                background: #fff;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .info-item:last-child {
                border-bottom: none;
            }
            
            .info-item-full {
                grid-column: 1 / -1;
                padding: 10px 0;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .label {
                font-weight: 600;
                color: #374151;
                font-size: 14px;
            }
            
            .valor {
                font-weight: 500;
                color: #1f2937;
                text-align: right;
                font-size: 14px;
            }
            
            .valor-destacado {
                font-weight: bold;
                color: #1E40AF;
                text-align: right;
                font-size: 14px;
            }
            
            .estado-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .estado-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #10B981;
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: bold;
                font-size: 16px;
                text-transform: uppercase;
            }
            
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 2px solid #e5e7eb;
            }
            
            .footer-title {
                font-size: 18px;
                font-weight: 600;
                color: #1E40AF;
                margin-bottom: 15px;
            }
            
            .contact-info {
                font-size: 14px;
                color: #666;
                margin-bottom: 5px;
            }
            
            .timestamp {
                font-size: 12px;
                color: #9ca3af;
                margin-top: 20px;
                font-style: italic;
            }
            
            .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 120px;
                color: rgba(30, 64, 175, 0.05);
                font-weight: bold;
                z-index: -1;
                pointer-events: none;
            }
            
            @media print {
                body {
                    margin: 0;
                    padding: 10px;
                }
                
                .comprobante {
                    border: 2px solid #1E40AF;
                    box-shadow: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="watermark">ULTRARRÁPIDOS</div>
        
        <div class="comprobante">
            <!-- Header -->
            <div class="header">
                <div class="company-name">${this.companyInfo.name}</div>
                <div class="company-subtitle">${this.companyInfo.subtitle}</div>
                
                <div class="comprobante-title">Comprobante de ${tipo}</div>
                <div class="numero-comprobante">No: ${numeroComprobante}</div>
                
                <div class="fecha-hora">
                    <div class="fecha-item">
                        <div class="fecha-label">Fecha</div>
                        <div class="fecha-valor">${fechaActual.toLocaleDateString('es-GT')}</div>
                    </div>
                    <div class="fecha-item">
                        <div class="fecha-label">Hora</div>
                        <div class="fecha-valor">${fechaActual.toLocaleTimeString('es-GT')}</div>
                    </div>
                </div>
            </div>
            
            <!-- Información del Vehículo -->
            <div class="seccion">
                <div class="seccion-header">
                    🚛 Información del Vehículo
                </div>
                <div class="seccion-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Placa:</span>
                            <span class="valor-destacado">${movimiento.placa}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Piloto:</span>
                            <span class="valor">${movimiento.piloto}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Origen:</span>
                            <span class="valor">${movimiento.origen || 'No especificado'}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Destino:</span>
                            <span class="valor">${movimiento.destino || 'No especificado'}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Detalles de la Carga -->
            <div class="seccion">
                <div class="seccion-header">
                    📦 Detalles de la Carga
                </div>
                <div class="seccion-content">
                    <div class="info-item">
                        <span class="label">Tipo de Carga:</span>
                        <span class="valor">${movimiento.tipoCarga || 'No especificado'}</span>
                    </div>
                    ${movimiento.observaciones ? `
                    <div class="info-item-full">
                        <div class="label">Observaciones:</div>
                        <div class="valor" style="margin-top: 8px; text-align: left;">${movimiento.observaciones}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Estado -->
            <div class="estado-section">
                <div class="estado-badge">
                    ${tipo === 'ingreso' ? '⬇️' : '⬆️'} ${tipo.toUpperCase()} REGISTRADO
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-title">¡Gracias por su confianza!</div>
                <div class="contact-info">📞 ${this.companyInfo.phone}</div>
                <div class="contact-info">📧 ${this.companyInfo.email}</div>
                <div class="contact-info">📍 ${this.companyInfo.address}</div>
                <div class="timestamp">
                    Comprobante generado el ${fechaActual.toLocaleString('es-GT')}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Generar PDF del comprobante
  async generateComprobantePDF(movimiento, tipo) {
    try {
      const html = this.generateComprobanteHTML(movimiento, tipo);
      
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        margins: {
          left: 20,
          top: 20,
          right: 20,
          bottom: 20,
        },
      });

      return uri;
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('No se pudo generar el PDF del comprobante');
    }
  }

  // Compartir PDF
  async sharePDF(pdfUri, filename) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('Compartir no está disponible en este dispositivo');
      }

      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir Comprobante PDF',
        UTI: 'com.adobe.pdf'
      });
      
      return true;
    } catch (error) {
      console.error('Error compartiendo PDF:', error);
      throw new Error('No se pudo compartir el PDF');
    }
  }

  // Guardar PDF en el dispositivo
  async savePDF(pdfUri, filename) {
    try {
      const documentDirectory = FileSystem.documentDirectory;
      const newUri = `${documentDirectory}${filename}`;
      
      await FileSystem.copyAsync({
        from: pdfUri,
        to: newUri
      });
      
      return newUri;
    } catch (error) {
      console.error('Error guardando PDF:', error);
      throw new Error('No se pudo guardar el PDF');
    }
  }

  // Imprimir PDF directamente
  async printPDF(movimiento, tipo) {
    try {
      const html = this.generateComprobanteHTML(movimiento, tipo);
      
      await Print.printAsync({
        html,
        printerUrl: undefined, // Permitir selección de impresora
      });
      
      return true;
    } catch (error) {
      console.error('Error imprimiendo PDF:', error);
      throw new Error('No se pudo imprimir el comprobante');
    }
  }

  // Generar nombre de archivo único
  generateFilename(movimiento, tipo) {
    const fecha = new Date().toISOString().split('T')[0];
    const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    return `comprobante_${tipo}_${movimiento.placa}_${fecha}_${hora}.pdf`;
  }
}

// Exportar instancia singleton
const pdfService = new PDFService();
export default pdfService;
