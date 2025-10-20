import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width, height } = Dimensions.get('window');

const PlateScanner = ({ visible, onClose, onScan, title = "Escanear Placa" }) => {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleManualInput = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Por favor ingresa una placa o código QR');
      return;
    }

    try {
      setProcessing(true);
      
      // Validar usando el servicio QR
      const validation = qrService.validateScanData(inputText.trim());
      
      if (!validation.valid) {
        Alert.alert(
          '⚠️ Formato No Válido',
          `${validation.error}\n\nFormatos válidos:\n• P-001AAA (Placa)\n• CAMION_QR:{...} (Código QR)`,
          [
            { text: 'Corregir', style: 'cancel' },
            { text: 'Usar de todos modos', onPress: () => confirmInput(inputText.trim()) }
          ]
        );
        return;
      }

      // Mostrar información de lo detectado
      if (validation.type === 'qr') {
        const qrData = validation.data;
        Alert.alert(
          '✅ Código QR Válido',
          `Camión: ${qrData.placa}\nMarca: ${qrData.marca} ${qrData.modelo}\nPiloto: ${qrData.piloto || 'No especificado'}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Usar Datos', onPress: () => confirmInput(inputText.trim()) }
          ]
        );
      } else {
        Alert.alert(
          '✅ Placa Válida',
          `Placa detectada: ${validation.placa}${validation.warning ? `\n⚠️ ${validation.warning}` : ''}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', onPress: () => confirmInput(inputText.trim()) }
          ]
        );
      }
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la entrada');
    } finally {
      setProcessing(false);
    }
  };

  const confirmInput = (data) => {
    onScan(data);
    setInputText('');
    onClose();
  };

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  const generateSampleQR = () => {
    const sampleQR = 'CAMION_QR:{"placa":"P-001AAA","marca":"Volvo","modelo":"FH16","año":2020,"piloto":"Juan Pérez","fechaGeneracion":"2025-10-18T15:30:00Z","tipo":"camion"}';
    setInputText(sampleQR);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color={COLORS.transport.primary} />
              <Text style={styles.infoTitle}>Scanner No Disponible en Expo Go</Text>
            </View>
            <Text style={styles.infoText}>
              El scanner de cámara requiere un Development Build. Por ahora puedes ingresar manualmente:
            </Text>
            <View style={styles.formatList}>
              <Text style={styles.formatItem}>• Placas: P-001AAA, C-123BBB</Text>
              <Text style={styles.formatItem}>• Códigos QR de camiones</Text>
            </View>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Ingresa la placa o código QR:</Text>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ej: P-001AAA o CAMION_QR:{...}"
              placeholderTextColor={COLORS.secondary[400]}
              multiline
              autoCapitalize="characters"
              autoCorrect={false}
            />
            
            {/* Sample QR Button */}
            <TouchableOpacity 
              style={styles.sampleButton}
              onPress={generateSampleQR}
            >
              <Ionicons name="code-working" size={16} color={COLORS.transport.primary} />
              <Text style={styles.sampleButtonText}>Usar QR de ejemplo</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, processing && styles.buttonDisabled]}
              onPress={handleManualInput}
              disabled={processing}
            >
              {processing ? (
                <Ionicons name="hourglass" size={20} color="white" />
              ) : (
                <Ionicons name="checkmark" size={20} color="white" />
              )}
              <Text style={styles.confirmButtonText}>
                {processing ? 'Procesando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Development Build Info */}
          <View style={styles.devBuildInfo}>
            <Ionicons name="build" size={20} color={COLORS.secondary[400]} />
            <Text style={styles.devBuildText}>
              Para usar el scanner de cámara, crea un Development Build con: npx expo run:android
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
  },
  infoText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  formatList: {
    gap: SPACING.xs,
  },
  formatItem: {
    fontSize: 14,
    color: COLORS.secondary[600],
  },
  inputSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginBottom: SPACING.md,
  },
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.secondary[300],
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.secondary[800],
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SPACING.md,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.transport.primary,
    gap: SPACING.xs,
  },
  sampleButtonText: {
    color: COLORS.transport.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: SPACING.sm,
  },
  confirmButtonText: {
    color: COLORS.transport.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  devBuildInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  devBuildText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
});

export default PlateScanner;
