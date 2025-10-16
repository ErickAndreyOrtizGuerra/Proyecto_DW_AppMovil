import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';

const { width } = Dimensions.get('window');

const IngresoEgresoScreen = () => {
  const [camiones, setCamiones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso'); // 'ingreso' o 'egreso'
  const [camionSeleccionado, setCamionSeleccionado] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [formData, setFormData] = useState({
    placa: '',
    piloto: '',
    origen: '',
    destino: '',
    tipoCarga: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarCamiones();
    cargarMovimientos();
  }, []);

  const cargarCamiones = async () => {
    try {
      const data = await transporteApi.getCamiones();
      setCamiones(data.filter(c => c.estado === 'activo'));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los camiones');
    }
  };

  const cargarMovimientos = () => {
    // Simulamos movimientos recientes (en una app real vendría de la API)
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
    setModalVisible(true);
    setFormData({
      placa: '',
      piloto: '',
      origen: '',
      destino: '',
      tipoCarga: '',
      observaciones: ''
    });
  };

  const registrarMovimiento = () => {
    if (!formData.placa || !formData.piloto) {
      Alert.alert('Error', 'Placa y piloto son campos obligatorios');
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      ...formData,
      tipo: tipoMovimiento,
      fecha: new Date().toISOString()
    };

    setMovimientos([nuevoMovimiento, ...movimientos]);
    setModalVisible(false);
    Alert.alert('Éxito', `${tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado correctamente`);
  };

  const seleccionarCamion = (camion) => {
    setFormData({
      ...formData,
      placa: camion.placa,
      piloto: formData.piloto
    });
    setCamionSeleccionado(camion);
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
    </View>
  );

  const ModalRegistro = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Registrar {tipoMovimiento === 'ingreso' ? 'Ingreso' : 'Egreso'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Placa del Camión *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.placa}
                onChangeText={(text) => setFormData({...formData, placa: text})}
                placeholder="Ej: P-001AAA"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
              />
              
              <Text style={styles.helperText}>Selecciona un camión activo:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.camionesScroll}>
                {camiones.slice(0, 5).map((camion) => (
                  <TouchableOpacity
                    key={camion.id}
                    style={[
                      styles.camionChip,
                      formData.placa === camion.placa && styles.camionChipSelected
                    ]}
                    onPress={() => seleccionarCamion(camion)}
                  >
                    <Text style={[
                      styles.camionChipText,
                      formData.placa === camion.placa && styles.camionChipTextSelected
                    ]}>
                      {camion.placa}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Piloto *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.piloto}
                onChangeText={(text) => setFormData({...formData, piloto: text})}
                placeholder="Nombre completo del piloto"
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {tipoMovimiento === 'ingreso' ? 'Origen' : 'Destino'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={tipoMovimiento === 'ingreso' ? formData.origen : formData.destino}
                onChangeText={(text) => setFormData({
                  ...formData,
                  [tipoMovimiento === 'ingreso' ? 'origen' : 'destino']: text
                })}
                placeholder={tipoMovimiento === 'ingreso' ? 'Lugar de origen' : 'Lugar de destino'}
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Carga</Text>
              <TextInput
                style={styles.textInput}
                value={formData.tipoCarga}
                onChangeText={(text) => setFormData({...formData, tipoCarga: text})}
                placeholder="Ej: Contenedores, Carga general, etc."
                autoCorrect={false}
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Observaciones</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.observaciones}
                onChangeText={(text) => setFormData({...formData, observaciones: text})}
                placeholder="Observaciones adicionales..."
                multiline
                numberOfLines={3}
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={registrarMovimiento}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Registrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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

      <ModalRegistro />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 10,
  },
  camionesScroll: {
    marginTop: 5,
  },
  camionChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  camionChipSelected: {
    backgroundColor: '#1E40AF',
  },
  camionChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  camionChipTextSelected: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1E40AF',
    gap: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IngresoEgresoScreen;
