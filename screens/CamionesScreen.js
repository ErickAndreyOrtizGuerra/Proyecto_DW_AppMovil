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

  const renderCamion = React.useCallback(({ item, index }) => (
    <Card
      style={styles.camionCard}
      onPress={() => navigation.navigate('CamionDetalle', { camion: item })}
      shadow="large"
      padding="lg"
    >
      <View style={styles.cardHeader}>
        <View style={styles.placaContainer}>
          <View style={[styles.tipoIconContainer, { backgroundColor: COLORS.transport.light }]}>
            <Ionicons name={getTipoIcon(item.tipo)} size={28} color={COLORS.transport.primary} />
          </View>
          <View style={styles.placaInfo}>
            <Heading level={4} color={COLORS.secondary[900]}>{item.placa}</Heading>
            <Caption color={COLORS.secondary[500]}>{item.marca} {item.modelo}</Caption>
          </View>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
          <Ionicons name={getEstadoIcon(item.estado)} size={14} color={COLORS.white} />
          <Caption color={COLORS.white} style={styles.estadoText}>
            {item.estado.replace('_', ' ').toUpperCase()}
          </Caption>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.secondary[400]} />
            </View>
            <View style={styles.infoContent}>
              <Caption color={COLORS.secondary[400]}>Año</Caption>
              <Body size="sm" weight="medium" color={COLORS.secondary[700]}>{item.año}</Body>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="scale-outline" size={16} color={COLORS.secondary[400]} />
            </View>
            <View style={styles.infoContent}>
              <Caption color={COLORS.secondary[400]}>Capacidad</Caption>
              <Body size="sm" weight="medium" color={COLORS.secondary[700]}>{item.capacidad} ton</Body>
            </View>
          </View>
        </View>
        
        <View style={styles.transportistaContainer}>
          <View style={styles.transportistaIcon}>
            <Ionicons name="business-outline" size={16} color={COLORS.secondary[400]} />
          </View>
          <View style={styles.transportistaInfo}>
            <Caption color={COLORS.secondary[400]}>Transportista</Caption>
            <Body size="sm" weight="medium" color={COLORS.secondary[700]} numberOfLines={1}>
              {item.transportista.nombre}
            </Body>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.tipoContainer}>
          <View style={[styles.tipoBadge, { backgroundColor: COLORS.secondary[100] }]}>
            <Body size="xs" weight="medium" color={COLORS.secondary[600]}>
              {item.tipo.toUpperCase()}
            </Body>
          </View>
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Body size="sm" weight="semibold" color={COLORS.transport.primary}>Ver detalles</Body>
          <Ionicons name="chevron-forward" size={16} color={COLORS.transport.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  ), [navigation]);

  const FiltroModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filtroModalVisible}
      onRequestClose={() => setFiltroModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por Estado</Text>
          
          {['todos', 'activo', 'mantenimiento', 'fuera_servicio'].map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filtroOption,
                filtroActivo === estado && styles.filtroOptionActive
              ]}
              onPress={() => {
                setFiltroActivo(estado);
                setFiltroModalVisible(false);
              }}
            >
              <Text style={[
                styles.filtroOptionText,
                filtroActivo === estado && styles.filtroOptionTextActive
              ]}>
                {estado === 'todos' ? 'Todos los camiones' : estado.replace('_', ' ')}
              </Text>
              {filtroActivo === estado && (
                <Ionicons name="checkmark" size={20} color="#1E40AF" />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setFiltroModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.headerIcon}>
          <Ionicons name="car-sport" size={32} color={COLORS.transport.primary} />
        </View>
        <ActivityIndicator size="large" color={COLORS.transport.primary} />
        <Body size="lg" weight="medium" color={COLORS.secondary[600]}>
          Cargando flota de camiones...
        </Body>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.transport.primary} />
      
      <LinearGradient
        colors={GRADIENTS.transport}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="car-sport" size={32} color={COLORS.white} />
            </View>
            <View style={styles.headerText}>
              <Heading level={2} color={COLORS.white}>Flota de Camiones</Heading>
              <Body size="base" color={COLORS.primary[100]}>
                {camionesFiltrados.length} de {camiones.length} vehículos
              </Body>
            </View>
          </View>
          
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
          length: 200,
          offset: 200 * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.headerIcon, { backgroundColor: COLORS.secondary[100] }]}>
              <Ionicons name="car-outline" size={32} color={COLORS.secondary[400]} />
            </View>
            <Heading level={4} color={COLORS.secondary[600]}>
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
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: BORDERS.radius['3xl'],
    borderBottomRightRadius: BORDERS.radius['3xl'],
  },
  
  headerContent: {
    gap: SPACING.xl,
  },
  
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDERS.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerText: {
    flex: 1,
    gap: SPACING.xs,
  },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDERS.radius.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchSection: {
    backgroundColor: COLORS.secondary[50],
  },
  
  filterContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  
  filterButton: {
    minWidth: 48,
  },
  listContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['6xl'],
    gap: SPACING.lg,
  },
  
  camionCard: {
    marginBottom: SPACING.lg,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  
  placaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  
  tipoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDERS.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  placaInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.xs,
  },
  
  estadoText: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.secondary[200],
    marginBottom: SPACING.lg,
  },
  cardBody: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDERS.radius.md,
    backgroundColor: COLORS.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
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
