import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';

const { width } = Dimensions.get('window');

const EstadisticasScreen = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await transporteApi.getEstadisticas();
      setEstadisticas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarEstadisticas();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const ChartCard = ({ title, data, icon, color }) => (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.chartTitle}>{title}</Text>
      </View>
      <View style={styles.chartContent}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{key}</Text>
            <View style={styles.chartBarContainer}>
              <View 
                style={[
                  styles.chartBar, 
                  { 
                    width: `${(value / Math.max(...Object.values(data))) * 100}%`,
                    backgroundColor: color 
                  }
                ]} 
              />
              <Text style={styles.chartValue}>{value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!estadisticas) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Error al cargar estadísticas</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Estadísticas</Text>
        <Text style={styles.headerSubtitle}>Resumen general de la flota</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Estadísticas Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚛 Flota de Camiones</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total de Camiones"
              value={estadisticas.totalCamiones}
              icon="car-outline"
              color="#1E40AF"
            />
            <StatCard
              title="Camiones Activos"
              value={estadisticas.camionesActivos}
              icon="checkmark-circle-outline"
              color="#10B981"
              subtitle={`${((estadisticas.camionesActivos / estadisticas.totalCamiones) * 100).toFixed(1)}%`}
            />
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="En Mantenimiento"
              value={estadisticas.camionesMantenimiento}
              icon="construct-outline"
              color="#F59E0B"
              subtitle={`${((estadisticas.camionesMantenimiento / estadisticas.totalCamiones) * 100).toFixed(1)}%`}
            />
            <StatCard
              title="Fuera de Servicio"
              value={estadisticas.camionesFueraServicio}
              icon="close-circle-outline"
              color="#EF4444"
              subtitle={`${((estadisticas.camionesFueraServicio / estadisticas.totalCamiones) * 100).toFixed(1)}%`}
            />
          </View>
        </View>

        {/* Estadísticas de Transportistas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Transportistas</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Transportistas"
              value={estadisticas.totalTransportistas}
              icon="people-outline"
              color="#8B5CF6"
            />
            <StatCard
              title="Empresas"
              value={estadisticas.empresas}
              icon="business-outline"
              color="#059669"
              subtitle={`${((estadisticas.empresas / estadisticas.totalTransportistas) * 100).toFixed(1)}%`}
            />
          </View>
          
          <View style={styles.statsGrid}>
            <StatCard
              title="Independientes"
              value={estadisticas.independientes}
              icon="person-outline"
              color="#DC2626"
              subtitle={`${((estadisticas.independientes / estadisticas.totalTransportistas) * 100).toFixed(1)}%`}
            />
            <StatCard
              title="Promedio Camiones/Empresa"
              value={estadisticas.empresas > 0 ? Math.round((estadisticas.totalCamiones - estadisticas.independientes) / estadisticas.empresas) : 0}
              icon="calculator-outline"
              color="#7C3AED"
            />
          </View>
        </View>

        {/* Gráficos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Distribución por Tipo</Text>
          <ChartCard
            title="Tipos de Camiones"
            data={estadisticas.tiposCamiones}
            icon="cube-outline"
            color="#3B82F6"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏭 Marcas Principales</Text>
          <ChartCard
            title="Marcas de Camiones"
            data={Object.fromEntries(
              Object.entries(estadisticas.marcasCamiones)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
            )}
            icon="car-outline"
            color="#10B981"
          />
        </View>

        {/* Información Adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Información Adicional</Text>
          <View style={styles.infoContent}>
            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Disponibilidad de flota: {((estadisticas.camionesActivos / estadisticas.totalCamiones) * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Tipo más común: {Object.entries(estadisticas.tiposCamiones).reduce((a, b) => estadisticas.tiposCamiones[a[0]] > estadisticas.tiposCamiones[b[0]] ? a : b)[0]}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="star-outline" size={20} color="#6B7280" />
              <Text style={styles.infoText}>
                Marca líder: {Object.entries(estadisticas.marcasCamiones).reduce((a, b) => estadisticas.marcasCamiones[a[0]] > estadisticas.marcasCamiones[b[0]] ? a : b)[0]}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chartContent: {
    gap: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
    textTransform: 'capitalize',
  },
  chartBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  chartBar: {
    height: 8,
    borderRadius: 4,
    minWidth: 20,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 10,
    minWidth: 30,
    textAlign: 'right',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  infoContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    marginTop: 16,
  },
});

export default EstadisticasScreen;
