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
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ordenesService from '../services/ordenesService';
import notificationService from '../services/notificationService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width } = Dimensions.get('window');

const OrdenesScreen = ({ navigation }) => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todas');
  const [estadisticas, setEstadisticas] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      try {
        if (isMounted) setLoading(true);
        await ordenesService.initialize();
        const todasLasOrdenes = await ordenesService.getOrdenes();
        const stats = await ordenesService.getEstadisticas();

        if (isMounted) {
          setOrdenes(todasLasOrdenes);
          setEstadisticas(stats);
        }
      } catch (error) {
        console.error('Error inicializando órdenes:', error);
        if (isMounted) {
          Alert.alert('Error', 'No se pudieron cargar las órdenes');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const cargarOrdenes = async () => {
    try {
      const todasLasOrdenes = await ordenesService.getOrdenes();
      setOrdenes(todasLasOrdenes);
    } catch (error) {
      console.error('Error cargando órdenes:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const stats = await ordenesService.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarOrdenes();
    await cargarEstadisticas();
    setRefreshing(false);
  };

  const filtrarOrdenes = () => {
    if (filtroActivo === 'todas') return ordenes;
    return ordenes.filter(orden => orden.estado === filtroActivo);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return '#F59E0B';
      case 'en_proceso': return '#3B82F6';
      case 'finalizada': return '#10B981';
      case 'cancelada': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente': return '#DC2626';
      case 'alta': return '#EA580C';
      case 'media': return '#D97706';
      case 'baja': return '#65A30D';
      default: return '#6B7280';
    }
  };

  const cambiarEstadoOrden = async (orden, nuevoEstado) => {
    try {
      await ordenesService.actualizarEstadoOrden(orden.id, nuevoEstado);
      await cargarOrdenes();
      await cargarEstadisticas();
      
      Alert.alert(
        'Éxito',
        `Orden ${orden.id} actualizada a ${nuevoEstado}`
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la orden');
    }
  };

  const mostrarOpcionesOrden = (orden) => {
    const opciones = [];
    
    if (orden.estado === 'pendiente') {
      opciones.push(
        { text: 'Iniciar', onPress: () => cambiarEstadoOrden(orden, 'en_proceso') },
        { text: 'Cancelar Orden', onPress: () => cambiarEstadoOrden(orden, 'cancelada'), style: 'destructive' }
      );
    } else if (orden.estado === 'en_proceso') {
      opciones.push(
        { text: 'Finalizar', onPress: () => cambiarEstadoOrden(orden, 'finalizada') },
        { text: 'Pausar', onPress: () => cambiarEstadoOrden(orden, 'pendiente') }
      );
    }

    opciones.push({ text: 'Cancelar', style: 'cancel' });

    Alert.alert('Acciones de Orden', `¿Qué deseas hacer con ${orden.id}?`, opciones);
  };

  const verificarOrdenesVencidas = async () => {
    try {
      const vencidas = await ordenesService.verificarOrdenesVencidas();
      if (vencidas.length > 0) {
        Alert.alert(
          'Órdenes Vencidas',
          `Se encontraron ${vencidas.length} órdenes vencidas. Se han enviado notificaciones.`
        );
      } else {
        Alert.alert('Sin Órdenes Vencidas', 'Todas las órdenes están al día.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron verificar las órdenes vencidas');
    }
  };

  const OrdenCard = ({ orden }) => {
    const esVencida = orden.estado === 'pendiente' && new Date(orden.fechaVencimiento) < new Date();
    
    return (
      <TouchableOpacity 
        style={[styles.ordenCard, esVencida && styles.ordenVencida]}
        onPress={() => mostrarOpcionesOrden(orden)}
      >
        <View style={styles.ordenHeader}>
          <View style={styles.ordenInfo}>
            <Text style={styles.ordenId}>{orden.id}</Text>
            <View style={styles.estadoBadge}>
              <View style={[styles.estadoIndicator, { backgroundColor: getEstadoColor(orden.estado) }]} />
              <Text style={[styles.estadoText, { color: getEstadoColor(orden.estado) }]}>
                {orden.estado.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={[styles.prioridadBadge, { backgroundColor: getPrioridadColor(orden.prioridad) + '20' }]}>
            <Text style={[styles.prioridadText, { color: getPrioridadColor(orden.prioridad) }]}>
              {orden.prioridad.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.ordenTitulo}>{orden.titulo}</Text>
        <Text style={styles.ordenDescripcion} numberOfLines={2}>{orden.descripcion}</Text>

        <View style={styles.ordenDetalles}>
          <View style={styles.detalleRow}>
            <Ionicons name="car" size={16} color={COLORS.secondary[600]} />
            <Text style={styles.detalleText}>{orden.camionAsignado} - {orden.piloto}</Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="location" size={16} color={COLORS.secondary[600]} />
            <Text style={styles.detalleText} numberOfLines={1}>
              {orden.origen} → {orden.destino}
            </Text>
          </View>
          <View style={styles.detalleRow}>
            <Ionicons name="business" size={16} color={COLORS.secondary[600]} />
            <Text style={styles.detalleText}>{orden.cliente}</Text>
          </View>
        </View>

        <View style={styles.ordenFooter}>
          <View style={styles.tiempoInfo}>
            <Ionicons name="time" size={14} color={COLORS.secondary[500]} />
            <Text style={styles.tiempoText}>
              Vence: {new Date(orden.fechaVencimiento).toLocaleDateString()} {new Date(orden.fechaVencimiento).toLocaleTimeString()}
            </Text>
          </View>
          <Text style={styles.costoText}>Q{orden.costo.toFixed(2)}</Text>
        </View>

        {esVencida && (
          <View style={styles.vencidaBanner}>
            <Ionicons name="warning" size={16} color="#FFFFFF" />
            <Text style={styles.vencidaText}>VENCIDA</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EstadisticaCard = ({ titulo, valor, subtitulo, icono, color }) => (
    <View style={[styles.estadisticaCard, { borderLeftColor: color }]}>
      <View style={styles.estadisticaHeader}>
        <View style={[styles.estadisticaIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icono} size={20} color={color} />
        </View>
        <View style={styles.estadisticaContent}>
          <Text style={styles.estadisticaValor}>{valor}</Text>
          <Text style={styles.estadisticaTitulo}>{titulo}</Text>
          {subtitulo && <Text style={styles.estadisticaSubtitulo}>{subtitulo}</Text>}
        </View>
      </View>
    </View>
  );

  const FiltroChip = ({ filtro, titulo, activo, onPress }) => (
    <TouchableOpacity
      style={[styles.filtroChip, activo && styles.filtroChipActivo]}
      onPress={onPress}
    >
      <Text style={[styles.filtroChipText, activo && styles.filtroChipTextActivo]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.transport.primary} />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  const ordenesFiltradas = filtrarOrdenes();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>📋 Órdenes de Trabajo</Text>
            <Text style={styles.headerSubtitle}>Gestión y seguimiento de órdenes</Text>
          </View>
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={verificarOrdenesVencidas}
          >
            <Ionicons name="alert-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Estadísticas */}
      {estadisticas && (
        <View style={styles.estadisticasSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.estadisticasScroll}>
            <EstadisticaCard
              titulo="Total"
              valor={estadisticas.total}
              icono="document-text"
              color="#3B82F6"
            />
            <EstadisticaCard
              titulo="Pendientes"
              valor={estadisticas.pendientes}
              icono="time"
              color="#F59E0B"
            />
            <EstadisticaCard
              titulo="En Proceso"
              valor={estadisticas.enProceso}
              icono="play-circle"
              color="#3B82F6"
            />
            <EstadisticaCard
              titulo="Finalizadas"
              valor={estadisticas.finalizadas}
              subtitulo={`${estadisticas.porcentajeCompletado}% completado`}
              icono="checkmark-circle"
              color="#10B981"
            />
            <EstadisticaCard
              titulo="Vencidas"
              valor={estadisticas.vencidas}
              icono="warning"
              color="#EF4444"
            />
          </ScrollView>
        </View>
      )}

      {/* Filtros */}
      <View style={styles.filtrosSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtrosScroll}>
          <FiltroChip
            filtro="todas"
            titulo="Todas"
            activo={filtroActivo === 'todas'}
            onPress={() => setFiltroActivo('todas')}
          />
          <FiltroChip
            filtro="pendiente"
            titulo="Pendientes"
            activo={filtroActivo === 'pendiente'}
            onPress={() => setFiltroActivo('pendiente')}
          />
          <FiltroChip
            filtro="en_proceso"
            titulo="En Proceso"
            activo={filtroActivo === 'en_proceso'}
            onPress={() => setFiltroActivo('en_proceso')}
          />
          <FiltroChip
            filtro="finalizada"
            titulo="Finalizadas"
            activo={filtroActivo === 'finalizada'}
            onPress={() => setFiltroActivo('finalizada')}
          />
        </ScrollView>
      </View>

      {/* Lista de Órdenes */}
      <FlatList
        data={ordenesFiltradas}
        renderItem={({ item }) => <OrdenCard orden={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.secondary[400]} />
            <Text style={styles.emptyTitle}>No hay órdenes</Text>
            <Text style={styles.emptySubtitle}>
              {filtroActivo === 'todas' 
                ? 'No se han creado órdenes aún' 
                : `No hay órdenes con estado: ${filtroActivo}`
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary[100],
  },
  alertButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadisticasSection: {
    paddingVertical: SPACING.lg,
  },
  estadisticasScroll: {
    paddingHorizontal: SPACING.lg,
  },
  estadisticaCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    minWidth: 120,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  estadisticaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estadisticaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  estadisticaContent: {
    flex: 1,
  },
  estadisticaValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
  },
  estadisticaTitulo: {
    fontSize: 12,
    color: COLORS.secondary[600],
    marginTop: 2,
  },
  estadisticaSubtitulo: {
    fontSize: 10,
    color: COLORS.secondary[500],
    marginTop: 1,
  },
  filtrosSection: {
    paddingVertical: SPACING.md,
  },
  filtrosScroll: {
    paddingHorizontal: SPACING.lg,
  },
  filtroChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.full,
    backgroundColor: COLORS.white,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary[300],
  },
  filtroChipActivo: {
    backgroundColor: COLORS.transport.primary,
    borderColor: COLORS.transport.primary,
  },
  filtroChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[600],
  },
  filtroChipTextActivo: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  ordenCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  ordenVencida: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ordenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ordenId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  estadoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prioridadBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDERS.radius.sm,
  },
  prioridadText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  ordenTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.xs,
  },
  ordenDescripcion: {
    fontSize: 14,
    color: COLORS.secondary[600],
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  ordenDetalles: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detalleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  detalleText: {
    fontSize: 13,
    color: COLORS.secondary[600],
    flex: 1,
  },
  ordenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tiempoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  tiempoText: {
    fontSize: 12,
    color: COLORS.secondary[500],
  },
  costoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.transport.primary,
  },
  vencidaBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopRightRadius: BORDERS.radius.lg,
    borderBottomLeftRadius: BORDERS.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  vencidaText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.secondary[600],
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.secondary[500],
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.secondary[600],
    marginTop: SPACING.lg,
  },
});

export default OrdenesScreen;
