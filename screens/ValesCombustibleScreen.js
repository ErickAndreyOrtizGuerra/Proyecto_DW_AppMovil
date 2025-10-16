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

const ValesCombustibleScreen = () => {
  const [vales, setVales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [camiones, setCamiones] = useState([]);
  const [formData, setFormData] = useState({
    numeroOrden: '',
    placa: '',
    piloto: '',
    camion: '',
    cantidadGalones: '',
    fechaHora: new Date().toISOString()
  });

  useEffect(() => {
    cargarCamiones();
    cargarVales();
  }, []);

  const cargarCamiones = async () => {
    try {
      const data = await transporteApi.getCamiones();
      setCamiones(data.filter(c => c.estado === 'activo'));
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los camiones');
    }
  };

  const cargarVales = () => {
    // Simulamos vales de combustible (en una app real vendría de la API)
    const valesSimulados = [
      {
        id: 1,
        numeroOrden: 'VC-001-2024',
        placa: 'P-001AAA',
        piloto: 'Juan Pérez',
        camion: 'Freightliner Cascadia',
        cantidadGalones: 45.5,
        fechaHora: new Date().toISOString(),
        estado: 'emitido'
      },
      {
        id: 2,
        numeroOrden: 'VC-002-2024',
        placa: 'M-100XYZ',
        piloto: 'María González',
        camion: 'Kenworth T680',
        cantidadGalones: 38.2,
        fechaHora: new Date(Date.now() - 7200000).toISOString(),
        estado: 'usado'
      },
      {
        id: 3,
        numeroOrden: 'VC-003-2024',
        placa: 'TN-400JKL',
        piloto: 'Carlos Rodríguez',
        camion: 'Mack Anthem',
        cantidadGalones: 52.0,
        fechaHora: new Date(Date.now() - 14400000).toISOString(),
        estado: 'emitido'
      }
    ];
    setVales(valesSimulados);
  };

  const generarNumeroOrden = () => {
    const fecha = new Date();
    const numero = String(vales.length + 1).padStart(3, '0');
    return `VC-${numero}-${fecha.getFullYear()}`;
  };

  const abrirModal = () => {
    setFormData({
      numeroOrden: generarNumeroOrden(),
      placa: '',
      piloto: '',
      camion: '',
      cantidadGalones: '',
      fechaHora: new Date().toISOString()
    });
    setModalVisible(true);
  };

  const seleccionarCamion = (camion) => {
    setFormData({
      ...formData,
      placa: camion.placa,
      camion: `${camion.marca} ${camion.modelo}`,
      piloto: formData.piloto
    });
  };

  const emitirVale = () => {
    if (!formData.placa || !formData.piloto || !formData.cantidadGalones) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (isNaN(formData.cantidadGalones) || parseFloat(formData.cantidadGalones) <= 0) {
      Alert.alert('Error', 'La cantidad de galones debe ser un número válido');
      return;
    }

    const nuevoVale = {
      id: Date.now(),
      ...formData,
      cantidadGalones: parseFloat(formData.cantidadGalones),
      estado: 'emitido'
    };

    setVales([nuevoVale, ...vales]);
    setModalVisible(false);
    Alert.alert('Éxito', `Vale ${formData.numeroOrden} emitido correctamente`);
  };

  const cambiarEstadoVale = (valeId) => {
    Alert.alert(
      'Cambiar Estado',
      '¿Marcar este vale como usado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setVales(vales.map(vale => 
              vale.id === valeId 
                ? { ...vale, estado: 'usado' }
                : vale
            ));
            Alert.alert('Éxito', 'Vale marcado como usado');
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'emitido': return '#F59E0B';
      case 'usado': return '#10B981';
      case 'cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const ValeCard = ({ vale }) => (
    <View style={styles.valeCard}>
      <View style={styles.valeHeader}>
        <View style={styles.ordenContainer}>
          <Ionicons name="document-text" size={24} color="#1E40AF" />
          <Text style={styles.numeroOrden}>{vale.numeroOrden}</Text>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(vale.estado) }]}>
          <Text style={styles.estadoText}>{vale.estado.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.valeBody}>
        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Vehículo:</Text>
          <Text style={styles.infoValue}>{vale.placa} - {vale.camion}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Piloto:</Text>
          <Text style={styles.infoValue}>{vale.piloto}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="speedometer-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Galones:</Text>
          <Text style={styles.infoValue}>{vale.cantidadGalones} gal</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#6B7280" />
          <Text style={styles.infoLabel}>Fecha:</Text>
          <Text style={styles.infoValue}>
            {new Date(vale.fechaHora).toLocaleString('es-GT')}
          </Text>
        </View>
      </View>

      {vale.estado === 'emitido' && (
        <View style={styles.valeFooter}>
          <TouchableOpacity
            style={styles.usarButton}
            onPress={() => cambiarEstadoVale(vale.id)}
          >
            <Ionicons name="checkmark-circle" size={16} color="white" />
            <Text style={styles.usarButtonText}>Marcar como Usado</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const ModalEmitirVale = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emitir Vale de Combustible</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Orden</Text>
              <TextInput
                style={[styles.textInput, styles.readOnlyInput]}
                value={formData.numeroOrden}
                editable={false}
              />
            </View>

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
              
              <Text style={styles.helperText}>Selecciona un camión:</Text>
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
              <Text style={styles.inputLabel}>Cantidad de Galones *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.cantidadGalones}
                onChangeText={(text) => setFormData({...formData, cantidadGalones: text})}
                placeholder="Ej: 45.5"
                keyboardType="numeric"
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha y Hora</Text>
              <TextInput
                style={[styles.textInput, styles.readOnlyInput]}
                value={new Date(formData.fechaHora).toLocaleString('es-GT')}
                editable={false}
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
              onPress={emitirVale}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.saveButtonText}>Emitir Vale</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const estadisticas = {
    totalVales: vales.length,
    valesEmitidos: vales.filter(v => v.estado === 'emitido').length,
    valesUsados: vales.filter(v => v.estado === 'usado').length,
    totalGalones: vales.reduce((sum, vale) => sum + vale.cantidadGalones, 0)
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⛽ Vales de Combustible</Text>
        <Text style={styles.headerSubtitle}>Control de combustible por camión</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estadisticas.totalVales}</Text>
          <Text style={styles.statLabel}>Total Vales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estadisticas.valesEmitidos}</Text>
          <Text style={styles.statLabel}>Emitidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estadisticas.valesUsados}</Text>
          <Text style={styles.statLabel}>Usados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{estadisticas.totalGalones.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Galones</Text>
        </View>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.emitirButton}
          onPress={abrirModal}
        >
          <Ionicons name="add-circle" size={24} color="white" />
          <Text style={styles.emitirButtonText}>Emitir Nuevo Vale</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Vales Recientes</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {vales.map((vale) => (
            <ValeCard key={vale.id} vale={vale} />
          ))}
          
          {vales.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No hay vales registrados</Text>
              <Text style={styles.emptySubtext}>
                Emite el primer vale de combustible
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <ModalEmitirVale />
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
    color: '#FEF3C7',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  emitirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  emitirButtonText: {
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
  valeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  valeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  ordenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numeroOrden: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valeBody: {
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
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  valeFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  usarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  usarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
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
    backgroundColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
    gap: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ValesCombustibleScreen;
