import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';
import qrService from '../services/qrService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width } = Dimensions.get('window');

const QRGeneratorScreen = ({ navigation }) => {
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    cargarCamiones();
  }, []);

  const cargarCamiones = async () => {
    try {
      setLoading(true);
      const data = await transporteApi.getCamiones();
      setCamiones(data);
    } catch (error) {
      console.error('Error cargando camiones:', error);
      Alert.alert('Error', 'No se pudieron cargar los camiones');
    } finally {
      setLoading(false);
    }
  };

  const generarQRParaCamion = (camion) => {
    try {
      // Generar datos QR para el camión
      const qrDataString = qrService.generateCamionQRData(camion);
      const qrInfo = qrService.generateQRInfo(camion);
      
      setSelectedCamion(camion);
      setQrData(qrDataString);
      setQrModalVisible(true);
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el código QR');
    }
  };

  const compartirQR = async () => {
    try {
      const qrInfo = qrService.generateQRInfo(selectedCamion);
      const mensaje = `🚛 Código QR - ${selectedCamion.placa}\n\n${qrInfo.detalles.join('\n')}\n\nDatos QR:\n${qrData}`;
      
      await Share.share({
        message: mensaje,
        title: `QR ${selectedCamion.placa}`
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código QR');
    }
  };

  const CamionCard = ({ camion }) => (
    <TouchableOpacity 
      style={styles.camionCard}
      onPress={() => generarQRParaCamion(camion)}
    >
      <View style={styles.camionHeader}>
        <View style={styles.placaBadge}>
          <Text style={styles.placaText}>{camion.placa}</Text>
        </View>
        <View style={[
          styles.estadoBadge,
          { backgroundColor: camion.estado === 'activo' ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.estadoText}>{camion.estado.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.camionInfo}>
        <Text style={styles.camionTitulo}>{camion.marca} {camion.modelo}</Text>
        <Text style={styles.camionSubtitulo}>Año: {camion.año}</Text>
        
        <View style={styles.detallesRow}>
          <View style={styles.detalleItem}>
            <Ionicons name="speedometer-outline" size={16} color={COLORS.secondary[600]} />
            <Text style={styles.detalleText}>{camion.capacidad}</Text>
          </View>
          <View style={styles.detalleItem}>
            <Ionicons name="person-outline" size={16} color={COLORS.secondary[600]} />
            <Text style={styles.detalleText}>{camion.piloto || 'Sin asignar'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.camionFooter}>
        <Ionicons name="qr-code" size={20} color={COLORS.transport.primary} />
        <Text style={styles.qrButtonText}>Generar QR</Text>
      </View>
    </TouchableOpacity>
  );

  const QRModal = () => (
    <Modal
      visible={qrModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setQrModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={[COLORS.transport.primary, COLORS.transport.secondary]}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity 
              onPress={() => setQrModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Código QR Generado</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.modalContent}>
          {selectedCamion && (
            <>
              {/* Información del camión */}
              <View style={styles.camionInfoSection}>
                <Text style={styles.sectionTitle}>Información del Camión</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Placa:</Text>
                    <Text style={styles.infoValue}>{selectedCamion.placa}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Marca:</Text>
                    <Text style={styles.infoValue}>{selectedCamion.marca}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Modelo:</Text>
                    <Text style={styles.infoValue}>{selectedCamion.modelo}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Año:</Text>
                    <Text style={styles.infoValue}>{selectedCamion.año}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Estado:</Text>
                    <Text style={[
                      styles.infoValue,
                      { color: selectedCamion.estado === 'activo' ? '#10B981' : '#EF4444' }
                    ]}>
                      {selectedCamion.estado.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Simulación del QR */}
              <View style={styles.qrSection}>
                <Text style={styles.sectionTitle}>Código QR</Text>
                <View style={styles.qrContainer}>
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code" size={120} color={COLORS.transport.primary} />
                    <Text style={styles.qrPlaceholderText}>
                      Código QR para {selectedCamion.placa}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Datos del QR */}
              <View style={styles.qrDataSection}>
                <Text style={styles.sectionTitle}>Datos del QR</Text>
                <View style={styles.qrDataContainer}>
                  <Text style={styles.qrDataText}>{qrData}</Text>
                </View>
              </View>

              {/* Instrucciones */}
              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>💡 Instrucciones de Uso</Text>
                <View style={styles.instructionCard}>
                  <Text style={styles.instructionText}>
                    • Imprime este código QR y pégalo en el camión{'\n'}
                    • El scanner de la app podrá leer este código{'\n'}
                    • Auto-completará la información del camión{'\n'}
                    • Facilita el registro de ingresos y egresos{'\n'}
                    • Reduce errores de captura manual
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Botones de acción */}
        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={compartirQR}
          >
            <Ionicons name="share" size={20} color="white" />
            <Text style={styles.actionButtonText}>Compartir</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.printButton}
            onPress={() => Alert.alert('Imprimir QR', 'Funcionalidad de impresión de QR próximamente')}
          >
            <Ionicons name="print" size={20} color="white" />
            <Text style={styles.actionButtonText}>Imprimir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>📱 Generador de QR</Text>
          <Text style={styles.headerSubtitle}>Códigos QR para camiones</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>¿Qué son los códigos QR?</Text>
          <Text style={styles.infoDescription}>
            Los códigos QR permiten identificar rápidamente los camiones al escanearlos. 
            Contienen toda la información del vehículo y facilitan el registro de movimientos.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Selecciona un camión para generar su QR:</Text>
        
        {camiones.map((camion) => (
          <CamionCard key={camion.id} camion={camion} />
        ))}
      </ScrollView>

      <QRModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary[100],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.transport.primary,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    marginBottom: SPACING.sm,
  },
  infoDescription: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[700],
    marginVertical: SPACING.lg,
  },
  camionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  camionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  placaBadge: {
    backgroundColor: COLORS.transport.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
  },
  placaText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.radius.sm,
  },
  estadoText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  camionInfo: {
    marginBottom: SPACING.md,
  },
  camionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    marginBottom: SPACING.xs,
  },
  camionSubtitulo: {
    fontSize: 14,
    color: COLORS.secondary[600],
    marginBottom: SPACING.md,
  },
  detallesRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  detalleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detalleText: {
    fontSize: 14,
    color: COLORS.secondary[600],
  },
  camionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
    gap: SPACING.sm,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.transport.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  modalHeaderContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  camionInfoSection: {
    marginVertical: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[600],
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.secondary[800],
  },
  qrSection: {
    marginVertical: SPACING.lg,
  },
  qrContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.secondary[300],
    borderStyle: 'dashed',
    borderRadius: BORDERS.radius.lg,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  qrDataSection: {
    marginVertical: SPACING.lg,
  },
  qrDataContainer: {
    backgroundColor: COLORS.secondary[100],
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
  },
  qrDataText: {
    fontSize: 12,
    color: COLORS.secondary[700],
    fontFamily: 'monospace',
  },
  instructionsSection: {
    marginVertical: SPACING.lg,
  },
  instructionCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
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
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRGeneratorScreen;
