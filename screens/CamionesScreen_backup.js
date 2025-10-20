import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';
import { Card, GradientCard } from '../components/Card';
import { Heading, Body, Caption } from '../components/Typography';
import { Button } from '../components/Button';
import { FloatingSearch } from '../components/FloatingSearch';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const CamionesScreen = ({ navigation }) => {
  const [camiones, setCamiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtroModalVisible, setFiltroModalVisible] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarCamiones();
    setRefreshing(false);
  };

  const camionesFiltrados = camiones.filter(camion =>
    camion.placa.toLowerCase().includes(searchText.toLowerCase()) ||
    camion.marca.toLowerCase().includes(searchText.toLowerCase()) ||
    camion.modelo.toLowerCase().includes(searchText.toLowerCase())
  );

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

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return COLORS.success;
      case 'mantenimiento': return COLORS.warning;
      case 'fuera_servicio': return COLORS.error;
      default: return COLORS.secondary[400];
    }
  };

  const FiltroModal = () => (
    <View>
      {/* Modal de filtros - implementar según necesidades */}
    </View>
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
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Heading size="xl" color={COLORS.white} weight="bold">
              🚛 Flota de Camiones
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
    gap: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    gap: SPACING.lg,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
    gap: SPACING.lg,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
    maxWidth: 280,
  },
});

export default CamionesScreen;
