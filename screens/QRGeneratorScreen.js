import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import transporteApi from '../services/transporteApi';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const QRGeneratorScreen = ({ navigation }) => {
  const [selectedCamion, setSelectedCamion] = useState(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState('');
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarTodosLosCamiones();
  }, []);

  const cargarTodosLosCamiones = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar desde la API
      const data = await transporteApi.getCamiones();
      
      if (data && data.length > 0) {
        setCamiones(data);
        console.log(`✅ Cargados ${data.length} camiones desde la API`);
      } else {
        // Si no hay datos de la API, usar datos extendidos de ejemplo
        cargarCamionesDeEjemplo();
      }
      
    } catch (error) {
      console.error('Error cargando camiones desde API:', error);
      // Si falla la API, usar datos de ejemplo
      cargarCamionesDeEjemplo();
    } finally {
      setLoading(false);
    }
  };

  const cargarCamionesDeEjemplo = () => {
    // Lista extendida de camiones de ejemplo
    const camionesEjemplo = [
      {
        id: 1,
        placa: 'P-001AAA',
        marca: 'Volvo',
        modelo: 'FH16',
        año: 2020,
        piloto: 'Juan Pérez',
        estado: 'activo',
        capacidad: '40 ton'
      },
      {
        id: 2,
        placa: 'C-123BBB',
        marca: 'Mercedes',
        modelo: 'Actros',
        año: 2019,
        piloto: 'María García',
        estado: 'activo',
        capacidad: '35 ton'
      },
      {
        id: 3,
        placa: 'TC-456CCC',
        marca: 'Scania',
        modelo: 'R450',
        año: 2021,
        piloto: 'Carlos López',
        estado: 'mantenimiento',
        capacidad: '45 ton'
      },
      {
        id: 4,
        placa: 'P-002DDD',
        marca: 'Kenworth',
        modelo: 'T800',
        año: 2018,
        piloto: 'Ana Martínez',
        estado: 'activo',
        capacidad: '38 ton'
      },
      {
        id: 5,
        placa: 'C-789EEE',
        marca: 'Freightliner',
        modelo: 'Cascadia',
        año: 2022,
        piloto: 'Roberto Silva',
        estado: 'activo',
        capacidad: '42 ton'
      },
      {
        id: 6,
        placa: 'P-003FFF',
        marca: 'Mack',
        modelo: 'Anthem',
        año: 2020,
        piloto: 'Luis Rodríguez',
        estado: 'activo',
        capacidad: '36 ton'
      },
      {
        id: 7,
        placa: 'C-456GGG',
        marca: 'Peterbilt',
        modelo: '579',
        año: 2021,
        piloto: 'Carmen Flores',
        estado: 'activo',
        capacidad: '44 ton'
      },
      {
        id: 8,
        placa: 'TC-789HHH',
        marca: 'Iveco',
        modelo: 'Stralis',
        año: 2019,
        piloto: 'Diego Morales',
        estado: 'mantenimiento',
        capacidad: '32 ton'
      },
      {
        id: 9,
        placa: 'P-004III',
        marca: 'DAF',
        modelo: 'XF',
        año: 2023,
        piloto: 'Patricia Vega',
        estado: 'activo',
        capacidad: '41 ton'
      },
      {
        id: 10,
        placa: 'C-012JJJ',
        marca: 'MAN',
        modelo: 'TGX',
        año: 2020,
        piloto: 'Fernando Castro',
        estado: 'activo',
        capacidad: '39 ton'
      },
      {
        id: 11,
        placa: 'P-005KKK',
        marca: 'Volvo',
        modelo: 'FH',
        año: 2018,
        piloto: 'Sandra Jiménez',
        estado: 'activo',
        capacidad: '37 ton'
      },
      {
        id: 12,
        placa: 'TC-345LLL',
        marca: 'Mercedes',
        modelo: 'Arocs',
        año: 2022,
        piloto: 'Miguel Herrera',
        estado: 'activo',
        capacidad: '43 ton'
      },
      {
        id: 13,
        placa: 'C-678MMM',
        marca: 'Scania',
        modelo: 'G450',
        año: 2019,
        piloto: 'Elena Vargas',
        estado: 'mantenimiento',
        capacidad: '34 ton'
      },
      {
        id: 14,
        placa: 'P-006NNN',
        marca: 'Renault',
        modelo: 'T High',
        año: 2021,
        piloto: 'Andrés Mendoza',
        estado: 'activo',
        capacidad: '40 ton'
      },
      {
        id: 15,
        placa: 'C-901OOO',
        marca: 'Isuzu',
        modelo: 'Giga',
        año: 2020,
        piloto: 'Gabriela Torres',
        estado: 'activo',
        capacidad: '33 ton'
      }
    ];

    setCamiones(camionesEjemplo);
    console.log(`📋 Cargados ${camionesEjemplo.length} camiones de ejemplo`);
    Alert.alert(
      'Información',
      `Se cargaron ${camionesEjemplo.length} camiones de ejemplo.\nPara cargar camiones reales, verifica la conexión con la API.`
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarTodosLosCamiones();
    setRefreshing(false);
  };

  const generarQRParaCamion = (camion) => {
    try {
      console.log('🔄 Generando QR para:', camion.placa);
      
      // Generar código QR usando el servicio
      const qrString = qrService.generateCamionQR(camion);
      
      console.log('✅ QR generado exitosamente');
      console.log('📱 Datos QR:', qrString);
      
      setSelectedCamion(camion);
      setQrData(qrString);
      setQrModalVisible(true);
      
    } catch (error) {
      console.error('❌ Error generando QR:', error);
      Alert.alert(
        'Error al Generar QR',
        `No se pudo crear el código QR para ${camion.placa}.\n\nError: ${error.message}`
      );
    }
  };

  const compartirQR = async () => {
    try {
      const mensaje = `🚛 Código QR - ${selectedCamion.placa}

📋 Información del Camión:
• Placa: ${selectedCamion.placa}
• Marca: ${selectedCamion.marca} ${selectedCamion.modelo}
• Año: ${selectedCamion.año}
• Piloto: ${selectedCamion.piloto}
• Estado: ${selectedCamion.estado}
• Capacidad: ${selectedCamion.capacidad}

📱 Código QR:
${qrData}

🕒 Generado: ${new Date().toLocaleString()}

💡 Usa este código en el Scanner de la app para auto-completar datos.`;
      
      await Share.share({
        message: mensaje,
        title: `QR Camión ${selectedCamion.placa}`
      });
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código QR');
    }
  };

  const copiarQR = () => {
    // En una implementación real, usarías Clipboard
    Alert.alert(
      '📋 Código QR',
      qrData,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Compartir', onPress: compartirQR }
      ]
    );
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
            <Text style={styles.detalleText}>{camion.piloto}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.camionFooter}>
        <Ionicons name="qr-code" size={20} color={COLORS.transport.primary} />
        <Text style={styles.qrButtonText}>Generar QR</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>📱 Generador de QR</Text>
            <Text style={styles.headerSubtitle}>Códigos QR para camiones</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.transport.primary} />
          <Text style={styles.loadingText}>Cargando camiones...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.transport.primary]}
              tintColor={COLORS.transport.primary}
            />
          }
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 ¿Cómo funciona?</Text>
            <Text style={styles.infoText}>
              • Selecciona un camión de la lista{'\n'}
              • Se generará un código QR con toda su información{'\n'}
              • Comparte el QR o úsalo en el Scanner{'\n'}
              • El QR auto-completa datos en registros
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{camiones.length}</Text>
              <Text style={styles.statLabel}>Camiones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {camiones.filter(c => c.estado === 'activo').length}
              </Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {camiones.filter(c => c.estado === 'mantenimiento').length}
              </Text>
              <Text style={styles.statLabel}>Mantenimiento</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>🚛 Selecciona un Camión ({camiones.length})</Text>
          
          {camiones.map((camion) => (
            <CamionCard key={camion.id} camion={camion} />
          ))}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}

      {/* Modal QR */}
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
              <Text style={styles.modalTitle}>✅ QR Generado</Text>
              <View style={styles.placeholder} />
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {selectedCamion && (
              <>
                {/* Información del camión */}
                <View style={styles.camionInfoSection}>
                  <Text style={styles.sectionTitle}>📋 Información del Camión</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Placa:</Text>
                      <Text style={styles.infoValue}>{selectedCamion.placa}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Marca:</Text>
                      <Text style={styles.infoValue}>{selectedCamion.marca} {selectedCamion.modelo}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Año:</Text>
                      <Text style={styles.infoValue}>{selectedCamion.año}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Piloto:</Text>
                      <Text style={styles.infoValue}>{selectedCamion.piloto}</Text>
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

                {/* Código QR */}
                <View style={styles.qrSection}>
                  <Text style={styles.sectionTitle}>📱 Código QR</Text>
                  <View style={styles.qrContainer}>
                    <View style={styles.qrPlaceholder}>
                      <Ionicons name="qr-code" size={80} color={COLORS.transport.primary} />
                      <Text style={styles.qrPlaceholderText}>Código QR Generado</Text>
                      <Text style={styles.qrPlaceholderSubtext}>
                        {selectedCamion.placa}
                      </Text>
                    </View>
                    
                    <View style={styles.qrDataContainer}>
                      <Text style={styles.qrDataTitle}>Datos del QR:</Text>
                      <Text style={styles.qrDataText} numberOfLines={3}>
                        {qrData}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={copiarQR}
                  >
                    <Ionicons name="copy" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Ver Código</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={compartirQR}
                  >
                    <Ionicons name="share" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Compartir</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>💡 Cómo usar este QR:</Text>
                  <Text style={styles.helpText}>
                    1. Comparte el código QR con el operador{'\n'}
                    2. En Movimientos, usa el botón "Scanner"{'\n'}
                    3. Pega el código QR completo{'\n'}
                    4. Los datos se auto-completarán automáticamente
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondary[600],
    marginTop: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.transport.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondary[600],
    marginTop: SPACING.xs,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    marginVertical: SPACING.md,
  },
  camionCard: {
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  camionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  placaBadge: {
    backgroundColor: COLORS.transport.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
  },
  placaText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.md,
  },
  estadoText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  camionInfo: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  camionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
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
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
    gap: SPACING.sm,
  },
  qrButtonText: {
    color: COLORS.transport.primary,
    fontWeight: '600',
    fontSize: 16,
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
    marginBottom: SPACING.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.secondary[600],
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.secondary[800],
    fontWeight: '600',
  },
  qrSection: {
    marginBottom: SPACING.xl,
  },
  qrContainer: {
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  qrPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  qrPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[700],
    marginTop: SPACING.md,
  },
  qrPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.secondary[500],
    marginTop: SPACING.xs,
  },
  qrDataContainer: {
    width: '100%',
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.secondary[100],
    borderRadius: BORDERS.radius.md,
  },
  qrDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[700],
    marginBottom: SPACING.sm,
  },
  qrDataText: {
    fontSize: 12,
    color: COLORS.secondary[600],
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: COLORS.transport.primary,
    gap: SPACING.sm,
  },
  shareButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.md,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
});

export default QRGeneratorScreen;
