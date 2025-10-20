import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

// Intentar importar cámara, fallar silenciosamente si no está disponible
let Camera, BarCodeScanner;
let cameraAvailable = false;

try {
  const cameraModule = require('expo-camera');
  const scannerModule = require('expo-barcode-scanner');
  Camera = cameraModule.Camera;
  BarCodeScanner = scannerModule.BarCodeScanner;
  cameraAvailable = true;
} catch (error) {
  console.log('Cámara no disponible en Expo Go, usando entrada manual');
  cameraAvailable = false;
}

const { width, height } = Dimensions.get('window');

const PlateScanner = ({ visible, onClose, onScan, title = "Escanear Placa" }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [useCamera, setUseCamera] = useState(false);

  useEffect(() => {
    if (visible && cameraAvailable) {
      checkCameraPermissions();
    }
  }, [visible]);

  const checkCameraPermissions = async () => {
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        setUseCamera(true);
      }
    } catch (error) {
      console.log('Error solicitando permisos de cámara:', error);
      setHasPermission(false);
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);
    
    try {
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
      
      if (validation.type === 'qr') {
        const qrInfo = validation.data;
        Alert.alert(
          '✅ Código QR Detectado',
          `Camión: ${qrInfo.placa}\nMarca: ${qrInfo.marca} ${qrInfo.modelo}\nPiloto: ${qrInfo.piloto || 'No especificado'}`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resetScanner() },
            { 
              text: 'Usar Datos', 
              onPress: () => confirmScan(data)
            }
          ]
        );
      } else {
        Alert.alert(
          '✅ Placa Detectada',
          `Placa: ${validation.placa}${validation.warning ? `\n⚠️ ${validation.warning}` : ''}`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resetScanner() },
            { text: 'Confirmar', onPress: () => confirmScan(validation.placa) }
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

  const handleManualInput = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Por favor ingresa una placa o código QR');
      return;
    }

    try {
      setProcessing(true);
      
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
    setScanned(false);
    setProcessing(false);
    onClose();
  };

  const generateSampleQR = () => {
    const sampleQR = 'CAMION_QR:{"placa":"P-001AAA","marca":"Volvo","modelo":"FH16","año":2020,"piloto":"Juan Pérez","fechaGeneracion":"2025-10-18T15:30:00Z","tipo":"camion"}';
    setInputText(sampleQR);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  // Renderizar cámara si está disponible y tiene permisos
  const renderCamera = () => {
    if (!cameraAvailable || hasPermission === null) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Verificando permisos de cámara...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Sin acceso a la cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear códigos QR y placas.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton}
            onPress={checkCameraPermissions}
          >
            <Text style={styles.permissionButtonText}>Solicitar Permisos</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          flashMode={flashOn ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.code128,
              BarCodeScanner.Constants.BarCodeType.code39,
              BarCodeScanner.Constants.BarCodeType.ean13,
              BarCodeScanner.Constants.BarCodeType.ean8,
            ],
          }}
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

        {/* Controles de cámara */}
        <View style={styles.cameraControls}>
          <TouchableOpacity 
            style={styles.flashButton}
            onPress={toggleFlash}
          >
            <Ionicons 
              name={flashOn ? "flash" : "flash-off"} 
              size={24} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
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
    );
  };

  // Renderizar entrada manual
  const renderManualInput = () => (
    <View style={styles.manualContainer}>
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color={COLORS.transport.primary} />
          <Text style={styles.infoTitle}>
            {cameraAvailable ? 'Entrada Manual' : 'Scanner No Disponible en Expo Go'}
          </Text>
        </View>
        <Text style={styles.infoText}>
          {cameraAvailable 
            ? 'También puedes ingresar manualmente la placa o código QR:'
            : 'El scanner de cámara requiere un Development Build. Por ahora puedes ingresar manualmente:'
          }
        </Text>
      </View>

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
        
        <TouchableOpacity 
          style={styles.sampleButton}
          onPress={generateSampleQR}
        >
          <Ionicons name="code-working" size={16} color={COLORS.transport.primary} />
          <Text style={styles.sampleButtonText}>Usar QR de ejemplo</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );

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
          <View style={styles.headerActions}>
            {cameraAvailable && hasPermission && (
              <TouchableOpacity 
                onPress={() => setUseCamera(!useCamera)}
                style={styles.toggleButton}
              >
                <Ionicons 
                  name={useCamera ? "keypad" : "camera"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {useCamera && cameraAvailable && hasPermission ? renderCamera() : renderManualInput()}
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
  headerActions: {
    width: 40,
    alignItems: 'flex-end',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos de cámara
  cameraContainer: {
    flex: 1,
  },
  camera: {
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
    width: 250,
    height: 250,
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
  cameraControls: {
    position: 'absolute',
    top: 100,
    right: SPACING.lg,
  },
  flashButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.lg,
    gap: SPACING.sm,
  },
  rescanText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  // Estilos de entrada manual
  manualContainer: {
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
  // Estilos de permisos
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    opacity: 0.9,
  },
  permissionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.lg,
  },
  permissionButtonText: {
    color: COLORS.transport.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PlateScanner;
