import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';

const { width } = Dimensions.get('window');

const ReportesScreen = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const stats = await transporteApi.getEstadisticas();
      setEstadisticas(stats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const generarReporte = (tipoReporte) => {
    Alert.alert(
      'Generar Reporte',
      `¿Deseas generar el reporte de ${tipoReporte}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: () => {
            Alert.alert('Éxito', `Reporte de ${tipoReporte} generado correctamente`);
          }
        }
      ]
    );
  };

  const ReporteCard = ({ titulo, descripcion, icono, color, onPress }) => (
    <TouchableOpacity style={styles.reporteCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + '90']}
        style={styles.reporteGradient}
      >
        <View style={styles.reporteHeader}>
          <Ionicons name={icono} size={32} color="white" />
          <Text style={styles.reporteTitulo}>{titulo}</Text>
        </View>
        <Text style={styles.reporteDescripcion}>{descripcion}</Text>
        <View style={styles.reporteFooter}>
          <Text style={styles.generarText}>Generar Reporte</Text>
          <Ionicons name="arrow-forward" size={16} color="white" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const MetricaCard = ({ titulo, valor, subtitulo, icono, color }) => (
    <View style={[styles.metricaCard, { borderLeftColor: color }]}>
      <View style={styles.metricaHeader}>
        <View style={[styles.metricaIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icono} size={24} color={color} />
        </View>
        <View style={styles.metricaContent}>
          <Text style={styles.metricaValor}>{valor}</Text>
          <Text style={styles.metricaTitulo}>{titulo}</Text>
          {subtitulo && <Text style={styles.metricaSubtitulo}>{subtitulo}</Text>}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="bar-chart" size={64} color="#1E40AF" />
        <Text style={styles.loadingText}>Cargando reportes...</Text>
      </View>
    );
  }

  const reportesOperativos = [
    {
      titulo: 'Ingresos Mensuales',
      descripcion: 'Reporte detallado de ingresos por predio filtrado por fechas y horas',
      icono: 'trending-up',
      color: '#10B981',
      tipo: 'ingresos'
    },
    {
      titulo: 'Egresos Mensuales',
      descripcion: 'Reporte mensual por predio con filtros por fechas y horas',
      icono: 'trending-down',
      color: '#EF4444',
      tipo: 'egresos'
    },
    {
      titulo: 'Vales de Combustible',
      descripcion: 'Vales emitidos por fecha, camión o piloto con totales',
      icono: 'speedometer',
      color: '#F59E0B',
      tipo: 'combustible'
    },
    {
      titulo: 'Reporte de Viajes',
      descripcion: 'Órdenes de trabajo por camión con kilómetros recorridos',
      icono: 'map',
      color: '#8B5CF6',
      tipo: 'viajes'
    }
  ];

  const reportesProductividad = [
    {
      titulo: 'Productividad Personal',
      descripcion: 'Registro desde inicio de sesión hasta cierre por empleado',
      icono: 'person',
      color: '#3B82F6',
      tipo: 'productividad'
    },
    {
      titulo: 'Consolidado Mensual',
      descripcion: 'Reporte mensual consolidado por empleado y actividades',
      icono: 'calendar',
      color: '#06B6D4',
      tipo: 'consolidado'
    },
    {
      titulo: 'Actividad por Usuario',
      descripcion: 'Cantidad de ingresos registrados y actividad por fecha',
      icono: 'analytics',
      color: '#84CC16',
      tipo: 'actividad'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📊 Reportes Operativos</Text>
        <Text style={styles.headerSubtitle}>Análisis y estadísticas del sistema</Text>
      </LinearGradient>

      {/* Métricas Generales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Métricas Generales</Text>
        <View style={styles.metricasGrid}>
          <MetricaCard
            titulo="Total Camiones"
            valor={estadisticas?.totalCamiones || 0}
            subtitulo={`${estadisticas?.camionesActivos || 0} activos`}
            icono="car"
            color="#1E40AF"
          />
          <MetricaCard
            titulo="Transportistas"
            valor={estadisticas?.totalTransportistas || 0}
            subtitulo={`${estadisticas?.empresas || 0} empresas`}
            icono="people"
            color="#059669"
          />
        </View>
        
        <View style={styles.metricasGrid}>
          <MetricaCard
            titulo="Disponibilidad"
            valor={estadisticas ? `${((estadisticas.camionesActivos / estadisticas.totalCamiones) * 100).toFixed(1)}%` : '0%'}
            subtitulo="Flota operativa"
            icono="speedometer"
            color="#10B981"
          />
          <MetricaCard
            titulo="En Mantenimiento"
            valor={estadisticas?.camionesMantenimiento || 0}
            subtitulo="Requieren atención"
            icono="construct"
            color="#F59E0B"
          />
        </View>
      </View>

      {/* Reportes Operativos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Reportes Operativos</Text>
        <View style={styles.reportesGrid}>
          {reportesOperativos.map((reporte, index) => (
            <ReporteCard
              key={index}
              titulo={reporte.titulo}
              descripcion={reporte.descripcion}
              icono={reporte.icono}
              color={reporte.color}
              onPress={() => generarReporte(reporte.tipo)}
            />
          ))}
        </View>
      </View>

      {/* Reportes de Productividad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Reportes de Productividad</Text>
        <View style={styles.reportesGrid}>
          {reportesProductividad.map((reporte, index) => (
            <ReporteCard
              key={index}
              titulo={reporte.titulo}
              descripcion={reporte.descripcion}
              icono={reporte.icono}
              color={reporte.color}
              onPress={() => generarReporte(reporte.tipo)}
            />
          ))}
        </View>
      </View>

      {/* Información Adicional */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Funcionalidades Móviles</Text>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="qr-code" size={20} color="#1E40AF" />
              <Text style={styles.infoText}>Escaneo de placas o QR para identificar camión</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="speedometer" size={20} color="#F59E0B" />
              <Text style={styles.infoText}>Registro de vales de combustible en tiempo real</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="notifications" size={20} color="#10B981" />
              <Text style={styles.infoText}>Notificaciones sobre órdenes pendientes</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
              <Text style={styles.infoText}>Impresión de comprobantes de ingreso/egreso</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 Seguridad del Sistema</Text>
          <View style={styles.infoContent}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.infoText}>Registro de logs de actividad por usuario</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="key" size={20} color="#F59E0B" />
              <Text style={styles.infoText}>Control de accesos por roles y validaciones</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="server" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>Respaldo automático de la base de datos</Text>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  metricasGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  metricaCard: {
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
  metricaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricaContent: {
    flex: 1,
  },
  metricaValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  metricaTitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  metricaSubtitulo: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reportesGrid: {
    gap: 15,
  },
  reporteCard: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  reporteGradient: {
    borderRadius: 16,
    padding: 20,
  },
  reporteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  reporteTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  reporteDescripcion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  reporteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generarText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  infoSection: {
    padding: 20,
    paddingTop: 0,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ReportesScreen;
