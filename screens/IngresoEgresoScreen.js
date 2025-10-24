import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';
import notificationService from '../services/notificationService';
import ComprobanteImpresion from '../components/ComprobanteImpresion';
import qrService from '../services/qrService';

const { width, height } = Dimensions.get('window');

const IngresoEgresoScreen = ({ navigation }) => {
  const [camiones, setCamiones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso');
  const [camionSeleccionado, setCamionSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [comprobanteVisible, setComprobanteVisible] = useState(false);
  const [movimientoParaComprobante, setMovimientoParaComprobante] = useState(null);
  const [tipoComprobanteActual, setTipoComprobanteActual] = useState('ingreso');
  
  // Estados separados para cada campo
  const [placa, setPlaca] = useState('');
  const [piloto, setPiloto] = useState('');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tipoCarga, setTipoCarga] = useState('');
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarCamiones();
    cargarMovimientos();
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
    }
  };

  const cargarCamiones = async () => {
    try {
      const data = await transporteApi.getCamiones();
      setCamiones(data.filter(c => c.estado === 'activo'));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los camiones');
    }
  };

  const cargarMovimientos = () => {
    const movimientosSimulados = [
      {
        id: 1,
        placa: 'P-001AAA',
        tipo: 'ingreso',
        piloto: 'Juan Pérez',
        fecha: new Date().toISOString(),
        origen: 'Puerto Quetzal',
        destino: 'Bodega Central',
        tipoCarga: 'Contenedores'
      },
      {
        id: 2,
        placa: 'M-100XYZ',
        tipo: 'egreso',
        piloto: 'María González',
        fecha: new Date(Date.now() - 3600000).toISOString(),
        origen: 'Bodega Central',
        destino: 'Zona 10',
        tipoCarga: 'Carga General'
      }
    ];
    setMovimientos(movimientosSimulados);
  };

  const abrirModal = (tipo) => {
    setTipoMovimiento(tipo);
    limpiarFormulario();
    setModalVisible(true);
  };

  const limpiarFormulario = () => {
    setPlaca('');
    setPiloto('');
    setOrigen('');
    setDestino('');
    setTipoCarga('');
    setObservaciones('');
    setCamionSeleccionado(null);
  };

  const registrarMovimiento = async () => {
    if (!placa || !piloto) {
      Alert.alert('Error', 'Placa y piloto son campos obligatorios');
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      placa,
      piloto,
      origen,
      destino,
      tipoCarga,
      observaciones,
      tipo: tipoMovimiento,
      fecha: new Date().toISOString()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setModalVisible(false);
    
    if (tipoMovimiento === 'ingreso') {
      await notificationService.notifyIngresoRegistrado(nuevoMovimiento);
    } else {
      await notificationService.notifyEgresoRegistrado(nuevoMovimiento);
    }
    
    Alert.alert(
      '✅ Registro Exitoso',
      `${tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado correctamente`,
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: '📄 Generar PDF',
          onPress: () => mostrarComprobante(nuevoMovimiento, tipoMovimiento)
        }
      ]
    );
  };

  const mostrarComprobante = (movimiento, tipo) => {
    setMovimientoParaComprobante(movimiento);
    setTipoComprobanteActual(tipo);
    setComprobanteVisible(true);
  };

  const seleccionarCamion = (camion) => {
    setPlaca(camion.placa);
    setCamionSeleccionado(camion);
  };

  const handleScanResult = async (scannedData) => {
    try {
      const validation = qrService.validateScanData(scannedData);
      
      if (!validation.valid) {
        Alert.alert('❌ Código No Válido', validation.error);
        return;
      }
      
      let placaIdentificada = validation.placa;
      let camionEncontrado = qrService.findCamionByPlate(placaIdentificada, camiones);
      
      if (validation.type === 'qr') {
        const qrData = validation.data;
        
        if (camionEncontrado) {
          setPlaca(camionEncontrado.placa);
          setPiloto(qrData.piloto || camionEncontrado.piloto || '');
          setCamionSeleccionado(camionEncontrado);
          
          Alert.alert(
            '✅ Camión Identificado por QR',
            `🚛 ${camionEncontrado.placa} - ${camionEncontrado.marca} ${camionEncontrado.modelo}\n👤 Piloto: ${qrData.piloto || 'No especificado'}\n📊 Estado: ${camionEncontrado.estado}`,
            [{ text: 'Continuar', style: 'default' }]
          );
        } else {
          setPlaca(qrData.placa);
          setPiloto(qrData.piloto || '');
          
          Alert.alert(
            '⚠️ Camión No Registrado',
            `El QR es válido pero la placa ${qrData.placa} no está en el sistema.\nSe usarán los datos del QR.`,
            [{ text: 'Continuar', style: 'default' }]
          );
        }
      } else {
        if (camionEncontrado) {
          setPlaca(camionEncontrado.placa);
          setPiloto(camionEncontrado.piloto || '');
          setCamionSeleccionado(camionEncontrado);
          
          Alert.alert(
            '✅ Placa Identificada',
            `🚛 ${camionEncontrado.placa} - ${camionEncontrado.marca} ${camionEncontrado.modelo}\n👤 Piloto: ${camionEncontrado.piloto || 'No asignado'}\n📊 Estado: ${camionEncontrado.estado}`,
            [{ text: 'Continuar', style: 'default' }]
          );
        } else {
          setPlaca(placaIdentificada);
          
          const sugerencias = qrService.searchCamionesByPlate(placaIdentificada, camiones);
          const mensajeSugerencias = sugerencias.length > 0 
            ? `\n\n🔍 Placas similares:\n${sugerencias.map(s => `• ${s.placa} (${s.descripcion})`).join('\n')}`
            : '';
          
          Alert.alert(
            '⚠️ Placa No Registrada',
            `La placa ${placaIdentificada} no está en el sistema.${mensajeSugerencias}\n\n¿Continuar con registro manual?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Continuar', style: 'default' }
            ]
          );
        }
      }
      
      await notificationService.sendLocalNotification(
        '📷 Escaneo Exitoso',
        `${validation.type === 'qr' ? 'QR' : 'Placa'} identificada: ${placaIdentificada}`,
        { 
          type: 'scan_success', 
          placa: placaIdentificada,
          scanType: validation.type
        }
      );
      
    } catch (error) {
      console.error('Error procesando escaneo:', error);
      Alert.alert(
        '❌ Error de Escaneo',
        'No se pudo procesar el código escaneado. Intenta nuevamente.'
      );
    }
  };

  const abrirScanner = () => {
    navigation.navigate('Scanner', {
      onScanResult: handleScanResult
    });
  };

  const MovimientoCard = ({ movimiento }) => (
    <View style={styles.movimientoCard}>
      <View style={styles.movimientoHeader}>
        <View style={[
          styles.tipoIndicator,
          { backgroundColor: movimiento.tipo === 'ingreso' ? '#10B981' : '#EF4444' }
        ]}>
          <Ionicons 
            name={movimiento.tipo === 'ingreso' ? 'arrow-down' : 'arrow-up'} 
            size={20} 
            color="white" 
          />
          <Text style={styles.tipoText}>
            {movimiento.tipo === 'ingreso' ? 'INGRESO' : 'EGRESO'}
          </Text>
        </View>
        <Text style={styles.fechaText}>
          {new Date(movimiento.fecha).toLocaleString('es-GT')}
        </Text>
      </View>
      
      <View style={styles.movimientoBody}>
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Placa:</Text>
          <Text style={styles.infoValue}>{movimiento.placa}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Piloto:</Text>
          <Text style={styles.infoValue}>{movimiento.piloto}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Ruta:</Text>
          <Text style={styles.infoValue}>{movimiento.origen} → {movimiento.destino}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Carga:</Text>
          <Text style={styles.infoValue}>{movimiento.tipoCarga}</Text>
        </View>
      </View>
      
      <View style={styles.movimientoFooter}>
        <TouchableOpacity 
          style={styles.printButton}
          onPress={() => mostrarComprobante(movimiento, movimiento.tipo)}
        >
          <Ionicons name="print" size={16} color="white" />
          <Text style={styles.printButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🚛 Control de Movimientos</Text>
        <Text style={styles.headerSubtitle}>Ingreso y egreso de camiones</Text>
      </LinearGradient>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.ingresoButton]}
          onPress={() => abrirModal('ingreso')}
        >
          <Ionicons name="arrow-down-circle" size={24} color="white" />
          <Text style={styles.actionButtonText}>Registrar Ingreso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.egresoButton]}
          onPress={() => abrirModal('egreso')}
        >
          <Ionicons name="arrow-up-circle" size={24} color="white" />
          <Text style={styles.actionButtonText}>Registrar Egreso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.scannerMainButton]}
          onPress={abrirScanner}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.actionButtonText}>Scanner</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {movimientos.map((movimiento) => (
            <MovimientoCard key={movimiento.id} movimiento={movimiento} />
          ))}
          
          {movimientos.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay movimientos registrados</Text>
              <Text style={styles.emptySubtext}>
                Registra el primer ingreso o egreso de camiones
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* MODAL COMPLETAMENTE REDISEÑADO */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header del Modal */}
          <LinearGradient
            colors={['#1E40AF', '#3B82F6']}
            style={styles.modalHeaderGradient}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>
                {tipoMovimiento === 'ingreso' ? '📥 Registrar Ingreso' : '📤 Registrar Egreso'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Contenido del formulario */}
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Placa */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Placa del Camión *</Text>
              <TextInput
                style={styles.fieldInput}
                value={placa}
                onChangeText={(text) => setPlaca(text)}
                placeholder="Ej: P-001AAA"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              />
            </View>

            {/* Chips de camiones */}
            <View style={styles.chipsContainer}>
              <Text style={styles.chipsLabel}>Camiones disponibles:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScrollContent}
              >
                {camiones.slice(0, 8).map((camion) => (
                  <TouchableOpacity
                    key={camion.id}
                    style={[
                      styles.chip,
                      placa === camion.placa && styles.chipSelected
                    ]}
                    onPress={() => seleccionarCamion(camion)}
                  >
                    <Text style={[
                      styles.chipText,
                      placa === camion.placa && styles.chipTextSelected
                    ]}>
                      {camion.placa}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Piloto */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nombre del Piloto *</Text>
              <TextInput
                style={styles.fieldInput}
                value={piloto}
                onChangeText={(text) => setPiloto(text)}
                placeholder="Nombre completo"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            {/* Origen/Destino */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>
                {tipoMovimiento === 'ingreso' ? 'Origen' : 'Destino'}
              </Text>
              <TextInput
                style={styles.fieldInput}
                value={tipoMovimiento === 'ingreso' ? origen : destino}
                onChangeText={(text) => tipoMovimiento === 'ingreso' ? setOrigen(text) : setDestino(text)}
                placeholder={tipoMovimiento === 'ingreso' ? 'Lugar de origen' : 'Lugar de destino'}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            {/* Tipo de Carga */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Tipo de Carga</Text>
              <TextInput
                style={styles.fieldInput}
                value={tipoCarga}
                onChangeText={(text) => setTipoCarga(text)}
                placeholder="Ej: Contenedores, Carga general"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            {/* Observaciones */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Observaciones</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldTextArea]}
                value={observaciones}
                onChangeText={(text) => setObservaciones(text)}
                placeholder="Observaciones adicionales..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.modalFooterFixed}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.btnSave}
              onPress={registrarMovimiento}
            >
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.btnSaveText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <ComprobanteImpresion
        visible={comprobanteVisible}
        onClose={() => setComprobanteVisible(false)}
        movimiento={movimientoParaComprobante}
        tipo={tipoComprobanteActual}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  ingresoButton: {
    backgroundColor: '#10B981',
  },
  egresoButton: {
    backgroundColor: '#EF4444',
  },
  scannerMainButton: {
    backgroundColor: '#8B5CF6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  movimientoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  movimientoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tipoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  tipoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fechaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  movimientoBody: {
    padding: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 60,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  movimientoFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'flex-end',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  printButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // ESTILOS DEL MODAL REDISEÑADO
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeaderGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  fieldInput: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  fieldTextArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  chipsContainer: {
    marginBottom: 24,
  },
  chipsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  chipsScrollContent: {
    paddingVertical: 4,
  },
  chip: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  chipSelected: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: 'white',
  },
  modalFooterFixed: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  btnCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  btnCancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6B7280',
  },
  btnSave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    gap: 8,
  },
  btnSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});

export default IngresoEgresoScreen;