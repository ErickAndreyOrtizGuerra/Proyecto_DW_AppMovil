import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDERS } from '../constants/Design';
import pdfService from '../services/pdfService';

const { width } = Dimensions.get('window');

const ComprobanteImpresion = ({ 
  visible, 
  onClose, 
  movimiento, 
  tipo // 'ingreso' o 'egreso'
}) => {
  const [loading, setLoading] = useState(false);
  
  if (!movimiento) return null;

  const fechaActual = new Date();
  const numeroComprobante = `${tipo.toUpperCase()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  const compartirComprobante = async () => {
    try {
      setLoading(true);
      
      // Generar PDF
      const pdfUri = await pdfService.generateComprobantePDF(movimiento, tipo);
      const filename = pdfService.generateFilename(movimiento, tipo);
      
      // Compartir PDF
      await pdfService.sharePDF(pdfUri, filename);
      
      Alert.alert('✅ Éxito', 'Comprobante PDF compartido correctamente');
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo compartir el comprobante PDF');
    } finally {
      setLoading(false);
    }
  };

  const imprimirComprobante = () => {
    Alert.alert(
      '🖨️ Opciones de Comprobante',
      'Selecciona una opción:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '📄 Generar PDF',
          onPress: generarPDF
        },
        {
          text: '🖨️ Imprimir Directo',
          onPress: imprimirDirecto
        }
      ]
    );
  };

  const generarPDF = async () => {
    try {
      setLoading(true);
      
      const pdfUri = await pdfService.generateComprobantePDF(movimiento, tipo);
      const filename = pdfService.generateFilename(movimiento, tipo);
      
      Alert.alert(
        '✅ PDF Generado',
        'El comprobante PDF ha sido generado correctamente.',
        [
          { text: 'Cerrar', style: 'cancel' },
          {
            text: '📤 Compartir',
            onPress: () => pdfService.sharePDF(pdfUri, filename)
          }
        ]
      );
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const imprimirDirecto = async () => {
    try {
      setLoading(true);
      
      await pdfService.printPDF(movimiento, tipo);
      
      Alert.alert('✅ Enviado a Impresión', 'El comprobante ha sido enviado a la impresora seleccionada');
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo imprimir el comprobante');
    } finally {
      setLoading(false);
    }
  };

  const generarTextoComprobante = () => {
    return `
═══════════════════════════════════
    TRANSPORTES ULTRARRÁPIDOS
═══════════════════════════════════

COMPROBANTE DE ${tipo.toUpperCase()}
No: ${numeroComprobante}

Fecha: ${fechaActual.toLocaleDateString()}
Hora: ${fechaActual.toLocaleTimeString()}

───────────────────────────────────
INFORMACIÓN DEL VEHÍCULO
───────────────────────────────────
Placa: ${movimiento.placa}
Piloto: ${movimiento.piloto}
Origen: ${movimiento.origen}
Destino: ${movimiento.destino}

───────────────────────────────────
DETALLES DE LA CARGA
───────────────────────────────────
Tipo de Carga: ${movimiento.tipoCarga}
Observaciones: ${movimiento.observaciones || 'Ninguna'}

───────────────────────────────────
INFORMACIÓN ADICIONAL
───────────────────────────────────
Tipo de Movimiento: ${tipo.toUpperCase()}
Estado: REGISTRADO
Registrado por: Sistema

═══════════════════════════════════
    ¡Gracias por su confianza!
    
    Tel: (502) 2234-5678
    Email: info@ultrarapidos.com
═══════════════════════════════════
    `;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.transport.primary, COLORS.transport.secondary]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Comprobante de {tipo}</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        {/* Comprobante */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.comprobante}>
            {/* Encabezado de la empresa */}
            <View style={styles.empresaHeader}>
              <Text style={styles.empresaNombre}>TRANSPORTES ULTRARRÁPIDOS</Text>
              <Text style={styles.empresaSubtitulo}>Servicios de Transporte de Carga</Text>
              <View style={styles.separador} />
            </View>

            {/* Información del comprobante */}
            <View style={styles.comprobanteInfo}>
              <Text style={styles.comprobanteTitle}>
                COMPROBANTE DE {tipo.toUpperCase()}
              </Text>
              <Text style={styles.numeroComprobante}>No: {numeroComprobante}</Text>
              
              <View style={styles.fechaHora}>
                <View style={styles.fechaHoraItem}>
                  <Text style={styles.label}>Fecha:</Text>
                  <Text style={styles.valor}>{fechaActual.toLocaleDateString()}</Text>
                </View>
                <View style={styles.fechaHoraItem}>
                  <Text style={styles.label}>Hora:</Text>
                  <Text style={styles.valor}>{fechaActual.toLocaleTimeString()}</Text>
                </View>
              </View>
            </View>

            {/* Información del vehículo */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitle}>INFORMACIÓN DEL VEHÍCULO</Text>
              <View style={styles.separadorSeccion} />
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Placa:</Text>
                  <Text style={styles.valorDestacado}>{movimiento.placa}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Piloto:</Text>
                  <Text style={styles.valor}>{movimiento.piloto}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Origen:</Text>
                  <Text style={styles.valor}>{movimiento.origen}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Destino:</Text>
                  <Text style={styles.valor}>{movimiento.destino}</Text>
                </View>
              </View>
            </View>

            {/* Detalles de la carga */}
            <View style={styles.seccion}>
              <Text style={styles.seccionTitle}>DETALLES DE LA CARGA</Text>
              <View style={styles.separadorSeccion} />
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Tipo de Carga:</Text>
                  <Text style={styles.valor}>{movimiento.tipoCarga}</Text>
                </View>
                {movimiento.observaciones && (
                  <View style={styles.infoItemFull}>
                    <Text style={styles.label}>Observaciones:</Text>
                    <Text style={styles.valor}>{movimiento.observaciones}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Estado del movimiento */}
            <View style={styles.estadoSeccion}>
              <View style={styles.estadoBadge}>
                <Ionicons 
                  name={tipo === 'ingreso' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.estadoTexto}>
                  {tipo.toUpperCase()} REGISTRADO
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerTexto}>¡Gracias por su confianza!</Text>
              <Text style={styles.contacto}>Tel: (502) 2234-5678</Text>
              <Text style={styles.contacto}>Email: info@ultrarapidos.com</Text>
              <Text style={styles.timestamp}>
                Generado el {fechaActual.toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.shareButton, loading && styles.buttonDisabled]} 
            onPress={compartirComprobante}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="share" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Generando...' : 'Compartir PDF'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.printButton, loading && styles.buttonDisabled]} 
            onPress={imprimirComprobante}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="print" size={20} color="white" />
            )}
            <Text style={styles.buttonText}>
              {loading ? 'Procesando...' : 'Imprimir PDF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  comprobante: {
    backgroundColor: 'white',
    marginVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  empresaHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  empresaNombre: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.transport.primary,
    textAlign: 'center',
  },
  empresaSubtitulo: {
    fontSize: 14,
    color: COLORS.secondary[600],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  separador: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.transport.primary,
    marginTop: SPACING.lg,
  },
  comprobanteInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  comprobanteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    marginBottom: SPACING.sm,
  },
  numeroComprobante: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.transport.primary,
    marginBottom: SPACING.lg,
  },
  fechaHora: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  fechaHoraItem: {
    alignItems: 'center',
  },
  seccion: {
    marginBottom: SPACING.xl,
  },
  seccionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary[700],
    marginBottom: SPACING.sm,
  },
  separadorSeccion: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.secondary[300],
    marginBottom: SPACING.lg,
  },
  infoGrid: {
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoItemFull: {
    paddingVertical: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[600],
    flex: 1,
  },
  valor: {
    fontSize: 14,
    color: COLORS.secondary[800],
    flex: 2,
    textAlign: 'right',
  },
  valorDestacado: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.transport.primary,
    flex: 2,
    textAlign: 'right',
  },
  estadoSeccion: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.full,
    gap: SPACING.sm,
  },
  estadoTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[300],
  },
  footerTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.transport.primary,
    marginBottom: SPACING.sm,
  },
  contacto: {
    fontSize: 12,
    color: COLORS.secondary[600],
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.secondary[500],
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.transport.secondary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.transport.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ComprobanteImpresion;
