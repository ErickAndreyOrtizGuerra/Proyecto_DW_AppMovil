import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, GradientCard } from '../components/Card';
import { Heading, Body, Caption, Label } from '../components/Typography';
import { Button } from '../components/Button';
import { COLORS, SPACING, BORDERS, SHADOWS, GRADIENTS, TYPOGRAPHY } from '../constants/Design';

const { width } = Dimensions.get('window');

const CamionDetalleScreen = ({ route, navigation }) => {
  const { camion } = route.params;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo': return COLORS.success[500];
      case 'mantenimiento': return COLORS.warning[500];
      case 'fuera_servicio': return COLORS.error[500];
      default: return COLORS.secondary[500];
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

  const handleContactar = () => {
    const telefono = camion.transportista.telefono;
    if (telefono) {
      const phoneNumber = telefono.replace(/[^0-9]/g, '');
      Linking.openURL(`tel:+502${phoneNumber}`);
    } else {
      Alert.alert('Error', 'No hay número de teléfono disponible');
    }
  };

  const handleEmail = () => {
    const email = camion.transportista.email;
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert('Error', 'No hay email disponible');
    }
  };

  const InfoCard = ({ title, children, icon, color = COLORS.transport.primary }) => (
    <Card style={styles.infoCard} shadow="medium" padding="xl">
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Heading level={4} color={COLORS.secondary[900]}>{title}</Heading>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </Card>
  );

  const InfoRow = ({ label, value, icon, color = COLORS.secondary[400] }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.infoTextContainer}>
        <Caption color={COLORS.secondary[500]}>{label}</Caption>
        <Body size="base" weight="medium" color={COLORS.secondary[800]}>{value}</Body>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.transport.primary} />
      
      {/* Header con gradiente mejorado */}
      <LinearGradient
        colors={GRADIENTS.transport}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="heart-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.vehicleInfo}>
            <View style={styles.tipoIconContainer}>
              <Ionicons name={getTipoIcon(camion.tipo)} size={40} color={COLORS.white} />
            </View>
            <View style={styles.vehicleDetails}>
              <Heading level={1} color={COLORS.white}>{camion.placa}</Heading>
              <Body size="lg" color={COLORS.primary[100]}>
                {camion.marca} {camion.modelo}
              </Body>
              <Caption color={COLORS.primary[200]}>
                {camion.tipo} • {camion.año} • {camion.capacidad} ton
              </Caption>
            </View>
          </View>
          
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(camion.estado) }]}>
            <Ionicons name={getEstadoIcon(camion.estado)} size={16} color={COLORS.white} />
            <Caption color={COLORS.white} style={styles.estadoText}>
              {camion.estado.replace('_', ' ').toUpperCase()}
            </Caption>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Información del Vehículo */}
        <InfoCard title="Información del Vehículo" icon="car-outline">
          <InfoRow label="Marca" value={camion.marca} icon="business-outline" />
          <InfoRow label="Modelo" value={camion.modelo} icon="car-outline" />
          <InfoRow label="Año" value={camion.año.toString()} icon="calendar-outline" />
          <InfoRow label="Tipo" value={camion.tipo} icon="cube-outline" />
          <InfoRow label="Capacidad" value={`${camion.capacidad} toneladas`} icon="scale-outline" />
        </InfoCard>

        {/* Información del Transportista */}
        <InfoCard title="Transportista" icon="person-outline" color={COLORS.success[500]}>
          <InfoRow 
            label="Nombre" 
            value={camion.transportista.nombre} 
            icon="business-outline" 
          />
          <InfoRow 
            label="Tipo" 
            value={camion.transportista.tipo} 
            icon="people-outline" 
          />
          {camion.transportista.nit && (
            <InfoRow 
              label="NIT" 
              value={camion.transportista.nit} 
              icon="document-text-outline" 
            />
          )}
          <InfoRow 
            label="Teléfono" 
            value={camion.transportista.telefono} 
            icon="call-outline" 
          />
          <InfoRow 
            label="Email" 
            value={camion.transportista.email} 
            icon="mail-outline" 
          />
          <InfoRow 
            label="Dirección" 
            value={camion.transportista.direccion} 
            icon="location-outline" 
          />
        </InfoCard>

        {/* Información Técnica */}
        <InfoCard title="Información Técnica" icon="settings-outline" color={COLORS.secondary[500]}>
          <InfoRow 
            label="ID del Camión" 
            value={camion.id.toString()} 
            icon="finger-print-outline" 
          />
          <InfoRow 
            label="Fecha de Registro" 
            value={new Date(camion.created_at).toLocaleDateString('es-GT')} 
            icon="calendar-outline" 
          />
          <InfoRow 
            label="Última Actualización" 
            value={new Date(camion.updated_at).toLocaleDateString('es-GT')} 
            icon="refresh-outline" 
          />
        </InfoCard>

        {/* Botones de Acción */}
        <View style={styles.actionButtons}>
          <Button
            variant="success"
            size="large"
            icon="call"
            onPress={handleContactar}
            style={styles.actionButton}
          >
            Llamar
          </Button>

          <Button
            variant="primary"
            size="large"
            icon="mail"
            onPress={handleEmail}
            style={styles.actionButton}
          >
            Email
          </Button>
        </View>

        {/* Información adicional */}
        <Card style={styles.additionalInfo} shadow="medium" padding="xl">
          <Heading level={4} color={COLORS.secondary[900]} style={styles.additionalTitle}>
            💡 Información Adicional
          </Heading>
          <Body size="base" color={COLORS.secondary[600]} style={styles.additionalText}>
            Este {camion.tipo.toLowerCase()} {camion.marca} {camion.modelo} del año {camion.año} 
            tiene una capacidad de carga de {camion.capacidad} toneladas y actualmente se encuentra 
            en estado "{camion.estado.replace('_', ' ')}".
          </Body>
          
          {camion.transportista.tipo === 'empresa' && (
            <Body size="base" color={COLORS.secondary[600]} style={styles.additionalText}>
              Pertenece a la empresa {camion.transportista.nombre}, 
              una compañía registrada con NIT {camion.transportista.nit}.
            </Body>
          )}
          
          {camion.transportista.tipo === 'independiente' && (
            <Body size="base" color={COLORS.secondary[600]} style={styles.additionalText}>
              Es propiedad del transportista independiente {camion.transportista.nombre}.
            </Body>
          )}
        </Card>
      </ScrollView>
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
    paddingBottom: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: BORDERS.radius['3xl'],
    borderBottomRightRadius: BORDERS.radius['3xl'],
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  
  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    flex: 1,
  },
  
  tipoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: BORDERS.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  vehicleDetails: {
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
  
  scrollContent: {
    flex: 1,
  },
  
  scrollContainer: {
    padding: SPACING.xl,
    gap: SPACING.xl,
  },
  
  infoCard: {
    marginBottom: SPACING.lg,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDERS.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cardContent: {
    gap: SPACING.lg,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BORDERS.radius.md,
    backgroundColor: COLORS.secondary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  infoTextContainer: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  
  actionButton: {
    flex: 1,
  },
  
  additionalInfo: {
    marginTop: SPACING.lg,
  },
  
  additionalTitle: {
    marginBottom: SPACING.lg,
  },
  
  additionalText: {
    lineHeight: TYPOGRAPHY.lineHeights.relaxed * TYPOGRAPHY.sizes.base,
    marginBottom: SPACING.md,
  },
});

export default CamionDetalleScreen;
