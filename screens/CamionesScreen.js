import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';
import { Card, GradientCard } from '../components/Card';
import { Heading, Body, Caption, Label } from '../components/Typography';
import { Button } from '../components/Button';
import FloatingSearch from '../components/FloatingSearch';
import { COLORS, SPACING, BORDERS, SHADOWS, GRADIENTS, TYPOGRAPHY } from '../constants/Design';

const { width } = Dimensions.get('window');

const CamionesScreen = ({ navigation }) => {
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroModalVisible, setFiltroModalVisible] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [searchText, setSearchText] = useState('');

  // Filtrar camiones usando useMemo para optimizar
  const camionesFiltrados = React.useMemo(() => {
    let resultado = [...camiones];

    // Filtro por estado
    if (filtroActivo !== 'todos') {
      resultado = resultado.filter(camion => camion.estado === filtroActivo);
    }

    // Filtro por búsqueda
    if (searchText.trim()) {
      const textoBusqueda = searchText.toLowerCase().trim();
      resultado = resultado.filter(camion =>
        camion.placa.toLowerCase().includes(textoBusqueda) ||
        camion.marca.toLowerCase().includes(textoBusqueda) ||
        camion.modelo.toLowerCase().includes(textoBusqueda) ||
        camion.tipo.toLowerCase().includes(textoBusqueda) ||
        camion.transportista.nombre.toLowerCase().includes(textoBusqueda)
      );
    }

    return resultado;
  }, [camiones, searchText, filtroActivo]);

  useEffect(() => {
    cargarCamiones();
  }, []);

  const cargarCamiones = async () => {
    try {
      setLoading(true);
      const data = await transporteApi.getCamiones();
      setCamiones(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los camiones');
      console.error('Error cargando camiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarCamiones();
    setRefreshing(false);
  };


  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return '#10B981';
      case 'mantenimiento': return '#F59E0B';
      case 'fuera_servicio': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo': return 'checkmark-circle';
      case 'mantenimiento': return 'construct';
      case 'fuera_servicio': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'plataforma': return 'car-sport';
      case 'furgón': return 'cube';
      case 'refrigerado': return 'snow';
      case 'tanque': return 'water';
      case 'carga general': return 'archive';
      default: return 'car';
    }
  };

  const renderCamion = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('CamionDetalle', { camion: item })}
      style={styles.camionCard}
    >
      <Card style={styles.cardContent}>
        <View style={styles.camionHeader}>
          <View style={styles.placaBadge}>
            <Text style={styles.placaText}>{item.placa}</Text>
          </View>
          <View style={[
            styles.estadoBadge,
            { backgroundColor: getEstadoColor(item.estado) }
          ]}>
            <Text style={styles.estadoText}>{item.estado.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.camionInfo}>
          <Heading size="lg" weight="semibold" color={COLORS.secondary[800]}>
            {item.marca} {item.modelo}
          </Heading>
          <Body size="sm" color={COLORS.secondary[600]}>
            Año: {item.año} • Capacidad: {item.capacidad}
          </Body>
          <Body size="sm" color={COLORS.secondary[600]}>
            Piloto: {item.piloto || 'No asignado'}
          </Body>
        </View>
      </Card>
    </TouchableOpacity>
  );


  const FiltroModal = () => (
    <View>
      {/* Modal de filtros - implementar según necesidades */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.transport.primary} />
        <Body size="lg" weight="medium" color={COLORS.secondary[600]}>
          Cargando flota de camiones...
        </Body>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Heading size="xl" color={COLORS.white} weight="bold">
              Flota de Camiones
            </Heading>
            <Body size="base" color={COLORS.primary[100]}>
              Gestión y control de vehículos
            </Body>
          </View>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => navigation.navigate('QRGenerator')}
          >
            <Ionicons name="qr-code" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Body size="lg" weight="bold" color={COLORS.white}>
                {camiones.filter(c => c.estado === 'activo').length}
              </Body>
              <Caption color={COLORS.primary[200]}>Activos</Caption>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Body size="lg" weight="bold" color={COLORS.white}>
                {camiones.filter(c => c.estado === 'mantenimiento').length}
              </Body>
              <Caption color={COLORS.primary[200]}>Mantenimiento</Caption>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Body size="lg" weight="bold" color={COLORS.white}>
                {camiones.filter(c => c.estado === 'fuera_servicio').length}
              </Body>
              <Caption color={COLORS.primary[200]}>Fuera Servicio</Caption>
            </View>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.searchSection}
      >
        <FloatingSearch
          placeholder="Buscar por placa, marca, modelo..."
          onChangeText={setSearchText}
        />
        
        <View style={styles.filterContainer}>
          <Button
            variant="outline"
            size="medium"
            icon="filter"
            onPress={() => setFiltroModalVisible(true)}
            style={styles.filterButton}
          />
          <View style={styles.countContainer}>
            <Body size="sm" color={COLORS.secondary[600]}>
              {camionesFiltrados.length} de {camiones.length} vehículos
            </Body>
          </View>
        </View>
      </KeyboardAvoidingView>

      <FlatList
        data={camionesFiltrados}
        renderItem={renderCamion}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-sport-outline" size={64} color={COLORS.secondary[300]} />
            <Heading size="lg" color={COLORS.secondary[500]} style={styles.emptyTitle}>
              No se encontraron camiones
            </Heading>
            <Body size="base" color={COLORS.secondary[400]} style={styles.emptySubtext}>
              {searchText ? 'Intenta con otros términos de búsqueda' : 'Actualiza para cargar los datos'}
            </Body>
          </View>
        }
      />

      <FiltroModal />
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
    paddingBottom: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  filterButton: {
    minWidth: 100,
  },
  countContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['2xl'],
  },
  camionCard: {
    marginBottom: SPACING.md,
  },
  cardContent: {
    padding: SPACING.lg,
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
  
  infoContent: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  
  transportistaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  
  transportistaIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDERS.radius.md,
    backgroundColor: COLORS.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  transportistaInfo: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  
  tipoContainer: {
    flex: 1,
  },
  
  tipoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.radius.md,
  },
  
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    gap: SPACING.lg,
  },
  
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.secondary[600],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['6xl'],
    gap: SPACING.lg,
  },
  
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[600],
  },
  
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[400],
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.sizes.base,
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
    padding: 20,
    width: width * 0.85,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtroOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  filtroOptionActive: {
    backgroundColor: '#EBF4FF',
  },
  filtroOptionText: {
    fontSize: 16,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  filtroOptionTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 20,
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CamionesScreen;
