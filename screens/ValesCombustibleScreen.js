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
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';
import notificationService from '../services/notificationService';

const { width } = Dimensions.get('window');

const ValesCombustibleScreen = () => {
  const [vales, setVales] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [camiones, setCamiones] = useState([]);
  
  // ⭐ ESTADOS SEPARADOS PARA CADA CAMPO - SOLUCIÓN AL PROBLEMA DEL TECLADO
  const [numeroOrden, setNumeroOrden] = useState('');
  const [placa, setPlaca] = useState('');
  const [piloto, setPiloto] = useState('');
  const [camion, setCamion] = useState('');
  const [cantidadGalones, setCantidadGalones] = useState('');
  const [fechaHora, setFechaHora] = useState(new Date().toISOString());

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

  const limpiarFormulario = () => {
    setPlaca('');
    setPiloto('');
    setCamion('');
    setCantidadGalones('');
    setFechaHora(new Date().toISOString());
  };

  const abrirModal = () => {
    setNumeroOrden(generarNumeroOrden());
    limpiarFormulario();
    setModalVisible(true);
  };

  const seleccionarCamion = (camionSeleccionado) => {
    setPlaca(camionSeleccionado.placa);
    setCamion(`${camionSeleccionado.marca} ${camionSeleccionado.modelo}`);
  };

  const emitirVale = async () => {
    if (!placa || !piloto || !cantidadGalones) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (isNaN(cantidadGalones) || parseFloat(cantidadGalones) <= 0) {
      Alert.alert('Error', 'La cantidad de galones debe ser un número válido');
      return;
    }

    try {
      // Datos para la API real - usar estructura correcta
      const valeData = {
        orden_trabajo_id: 1, // Por ahora usar ID fijo, debería venir de una orden real
        cantidad_galones: parseFloat(cantidadGalones), // IMPORTANTE: usar cantidad_galones
        precio_galon: 6.00, // Precio por defecto
        fecha_vale: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato YYYY-MM-DD HH:MM:SS
        observaciones: `Vale para ${placa} - Piloto: ${piloto}`
      };

      // Crear vale usando la API real
      const response = await transporteApi.createValeCombustible(valeData);
      
      if (response.success) {
        // Actualizar lista local con el vale creado
        const nuevoVale = {
          id: response.data.id,
          numeroOrden,
          placa,
          piloto,
          camion,
          cantidadGalones: response.data.cantidad_galones,
          fechaHora,
          estado: 'emitido',
          apiData: response.data // Guardar datos completos de la API
        };

        setVales([nuevoVale, ...vales]);
        setModalVisible(false);
        
        // Enviar notificación
        await notificationService.notifyValeRegistrado(nuevoVale);
        
        Alert.alert('✅ Éxito', `Vale creado correctamente\nID: ${response.data.id}\nTotal: Q${response.data.total}`);
      } else {
        Alert.alert('❌ Error', response.message || 'No se pudo crear el vale');
      }
    } catch (error) {
      console.error('Error creando vale:', error);
      Alert.alert('❌ Error de Conexión', 'No se pudo conectar con el servidor');
    }
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⛽ Vales de Combustible</Text>
        <Text style={styles.headerSubtitle}>Control de abastecimiento</Text>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vales.filter(v => v.estado === 'emitido').length}</Text>
          <Text style={styles.statLabel}>Emitidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{vales.filter(v => v.estado === 'usado').length}</Text>
          <Text style={styles.statLabel}>Usados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {vales.reduce((sum, v) => sum + v.cantidadGalones, 0).toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Total Gal</Text>
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
        <Text style={styles.sectionTitle}>Historial de Vales</Text>
        
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

      {/* MODAL CON PATRÓN DE ESTADOS SEPARADOS */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header del Modal */}
          <LinearGradient
            colors={['#F59E0B', '#F97316']}
            style={styles.modalHeaderGradient}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalHeaderTitle}>⛽ Emitir Vale de Combustible</Text>
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
            {/* Número de Orden */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Número de Orden</Text>
              <TextInput
                style={[styles.fieldInput, styles.readOnlyInput]}
                value={numeroOrden}
                editable={false}
              />
            </View>

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
                autoCorrect={false}
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
                {camiones.slice(0, 8).map((camionItem) => (
                  <TouchableOpacity
                    key={camionItem.id}
                    style={[
                      styles.chip,
                      placa === camionItem.placa && styles.chipSelected
                    ]}
                    onPress={() => seleccionarCamion(camionItem)}
                  >
                    <Text style={[
                      styles.chipText,
                      placa === camionItem.placa && styles.chipTextSelected
                    ]}>
                      {camionItem.placa}
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
                placeholder="Nombre completo del piloto"
                placeholderTextColor="#9CA3AF"
                autoCorrect={false}
                autoCapitalize="words"
              />
            </View>

            {/* Cantidad de Galones */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Cantidad de Galones *</Text>
              <TextInput
                style={styles.fieldInput}
                value={cantidadGalones}
                onChangeText={(text) => setCantidadGalones(text)}
                placeholder="Ej: 45.5"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoCorrect={false}
              />
            </View>

            {/* Fecha y Hora */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Fecha y Hora</Text>
              <TextInput
                style={[styles.fieldInput, styles.readOnlyInput]}
                value={new Date(fechaHora).toLocaleString('es-GT')}
                editable={false}
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
              onPress={emitirVale}
            >
              <Ionicons name="document-text" size={22} color="white" />
              <Text style={styles.btnSaveText}>Emitir Vale</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  
  // ESTILOS DEL MODAL
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
  readOnlyInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
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
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
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
    backgroundColor: '#F59E0B',
    gap: 8,
  },
  btnSaveText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'white',
  },
});

export default ValesCombustibleScreen;
