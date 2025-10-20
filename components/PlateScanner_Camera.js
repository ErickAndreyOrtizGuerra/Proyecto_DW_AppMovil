import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width, height } = Dimensions.get('window');

const PlateScanner = ({ visible, onClose, onScan, title = "Escanear Placa" }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (visible) {
      getBarCodeScannerPermissions();
      setScanned(false);
    }
  }, [visible]);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);
    
    try {
      // Validar datos escaneados usando el servicio QR
      const validation = qrService.validateScanData(data);
      
      if (!validation.valid) {
        Alert.alert(
          '❌ Código No Válido',
          validation.error,
          [
            { text: 'Reintentar', onPress: () => resetScanner() },
            { text: 'Cancelar', onPress: onClose }
          ]
        );
        return;
      }
      
      // Procesar según el tipo de código
      if (validation.type === 'qr') {
        // Es un código QR de camión
        const qrInfo = validation.data;
        Alert.alert(
          '✅ Código QR Detectado',
          `Camión: ${qrInfo.placa}\nMarca: ${qrInfo.marca} ${qrInfo.modelo}\nPiloto: ${qrInfo.piloto || 'No especificado'}`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resetScanner() },
            { 
              text: 'Usar Datos', 
              onPress: () => confirmScan(data) // Enviar datos completos del QR
            }
          ]
        );
      } else if (validation.type === 'placa') {
        // Es una placa válida
        Alert.alert(
          '✅ Placa Detectada',
          `Placa: ${validation.placa}${validation.warning ? `\n⚠️ ${validation.warning}` : ''}`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resetScanner() },
            { text: 'Confirmar', onPress: () => confirmScan(validation.placa) }
          ]
        );
      } else {
        // Placa con formato personalizado
        Alert.alert(
          '⚠️ Formato No Estándar',
          `Placa detectada: ${validation.placa}\n${validation.warning}`,
          [
            { text: 'Reintentar', onPress: () => resetScanner() },
            { text: 'Usar de todos modos', onPress: () => confirmScan(validation.placa) }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error procesando código:', error);
      Alert.alert(
        '❌ Error de Procesamiento',
        'No se pudo procesar el código escaneado. Intenta nuevamente.',
        [
          { text: 'Reintentar', onPress: () => resetScanner() },
          { text: 'Cancelar', onPress: onClose }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProcessing(false);
  };

  const confirmScan = (scannedData) => {
    onScan(scannedData);
    onClose();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off" size={64} color={COLORS.secondary[400]} />
          <Text style={styles.permissionTitle}>Sin permisos de cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear placas y códigos QR
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
            <Text style={styles.permissionButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
            <Ionicons 
              name={flashOn ? "flash" : "flash-off"} 
              size={24} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>

        {/* Scanner */}
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
            flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
            barCodeTypes={[
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.code128,
              BarCodeScanner.Constants.BarCodeType.code39,
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
            ]}
          />
          
          {/* Overlay con marco de escaneo */}
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>
            {processing ? '🔄 Procesando...' : scanned ? '✅ Código detectado!' : '📷 Apunta la cámara al código'}
          </Text>
          <Text style={styles.instructionText}>
            {processing 
              ? 'Validando información del código...'
              : scanned 
                ? 'Código capturado correctamente' 
                : 'Escanea la placa del camión o código QR'
            }
          </Text>
          
          {processing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={COLORS.white} />
              <Text style={styles.processingText}>Analizando código...</Text>
            </View>
          )}
          
          {scanned && !processing && (
            <TouchableOpacity 
              style={styles.rescanButton}
              onPress={resetScanner}
            >
              <Ionicons name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.rescanText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary[900],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  flashButton: {
    padding: SPACING.sm,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: COLORS.white,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    padding: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.secondary[300],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.transport.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  rescanText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.secondary[800],
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.secondary[600],
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  permissionButton: {
    backgroundColor: COLORS.transport.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.lg,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  processingText: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});

export default PlateScanner;
