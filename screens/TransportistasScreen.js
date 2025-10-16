import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Linking,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import transporteApi from '../services/transporteApi';

const { width } = Dimensions.get('window');

const TransportistasScreen = ({ navigation }) => {
  const [transportistas, setTransportistas] = useState([]);
  const [transportistasFiltrados, setTransportistasFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    cargarTransportistas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [transportistas, searchText, filtroTipo]);

  const cargarTransportistas = async () => {
    try {
      setLoading(true);
      const data = await transporteApi.getTransportistas();
      setTransportistas(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los transportistas');
      console.error('Error cargando transportistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarTransportistas();
    setRefreshing(false);
  };

  const aplicarFiltros = () => {
    let resultado = [...transportistas];

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(transportista => transportista.tipo === filtroTipo);
    }

    // Filtro por búsqueda
    if (searchText.trim()) {
      const textoBusqueda = searchText.toLowerCase().trim();
      resultado = resultado.filter(transportista =>
        transportista.nombre.toLowerCase().includes(textoBusqueda) ||
        (transportista.nit && transportista.nit.toLowerCase().includes(textoBusqueda)) ||
        transportista.telefono.toLowerCase().includes(textoBusqueda) ||
        transportista.email.toLowerCase().includes(textoBusqueda) ||
        transportista.direccion.toLowerCase().includes(textoBusqueda)
      );
    }

    setTransportistasFiltrados(resultado);
  };

  const handleCall = (telefono) => {
    if (telefono) {
      const phoneNumber = telefono.replace(/[^0-9]/g, '');
      Linking.openURL(`tel:+502${phoneNumber}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const getTipoIcon = (tipo) => {
    return tipo === 'empresa' ? 'business' : 'person';
  };

  const getTipoColor = (tipo) => {
    return tipo === 'empresa' ? '#1E40AF' : '#059669';
  };

  const renderTransportista = ({ item }) => (
    <View style={styles.transportistaCard}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.tipoContainer}>
            <View style={[styles.tipoIcon, { backgroundColor: getTipoColor(item.tipo) }]}>
              <Ionicons name={getTipoIcon(item.tipo)} size={24} color="white" />
            </View>
            <View style={styles.nombreContainer}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={[styles.tipo, { color: getTipoColor(item.tipo) }]}>
                {item.tipo === 'empresa' ? '🏢 Empresa' : '👤 Independiente'}
              </Text>
            </View>
          </View>
          
          {item.active && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.activeText}>Activo</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          {item.nit && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>NIT: {item.nit}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{item.telefono}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{item.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{item.direccion}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleCall(item.telefono)}
          >
            <Ionicons name="call" size={16} color="white" />
            <Text style={styles.actionButtonText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={() => handleEmail(item.email)}
          >
            <Ionicons name="mail" size={16} color="white" />
            <Text style={styles.actionButtonText}>Email</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const FiltroTabs = () => (
    <View style={styles.filtroTabs}>
      {['todos', 'empresa', 'independiente'].map((tipo) => (
        <TouchableOpacity
          key={tipo}
          style={[
            styles.filtroTab,
            filtroTipo === tipo && styles.filtroTabActive
          ]}
          onPress={() => setFiltroTipo(tipo)}
        >
          <Text style={[
            styles.filtroTabText,
            filtroTipo === tipo && styles.filtroTabTextActive
          ]}>
            {tipo === 'todos' ? 'Todos' : tipo === 'empresa' ? 'Empresas' : 'Independientes'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.loadingText}>Cargando transportistas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>👥 Transportistas</Text>
        <Text style={styles.headerSubtitle}>
          {transportistasFiltrados.length} de {transportistas.length} transportistas
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, NIT, teléfono..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#9CA3AF"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            blurOnSubmit={false}
          />
        </View>
      </View>

      <FiltroTabs />

      <FlatList
        data={transportistasFiltrados}
        renderItem={renderTransportista}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No se encontraron transportistas</Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Intenta con otros términos de búsqueda' : 'Actualiza para cargar los datos'}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#374151',
  },
  filtroTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 10,
  },
  filtroTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filtroTabActive: {
    backgroundColor: '#1E40AF',
  },
  filtroTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filtroTabTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transportistaCard: {
    marginBottom: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  tipoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nombreContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  tipo: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 10,
    marginBottom: 15,
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
  cardFooter: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  emailButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
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
});

export default TransportistasScreen;
