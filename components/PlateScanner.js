import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const PlateScanner = ({ visible, onClose, onScan, title = "Escanear Placa/QR" }) => {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputMode, setInputMode] = useState('plate'); // 'plate' o 'qr'

  // Placas de ejemplo comunes en Guatemala
  const commonPlates = [
    'P-001AAA', 'P-002BBB', 'P-003CCC',
    'C-123AAA', 'C-456BBB', 'C-789CCC',
    'TC-001AAA', 'TC-002BBB', 'TC-003CCC'
  ];

  const handleInputChange = (text) => {
    setInputText(text);
    
    // Generar sugerencias en tiempo real
    if (inputMode === 'plate' && text.length > 0) {
      const filtered = commonPlates.filter(plate => 
        plate.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const validateAndProcess = async (data) => {
    if (!data.trim()) {
      Alert.alert('❌ Error', 'Por favor ingresa una placa o código QR');
      return;
    }

    try {
      setProcessing(true);
      
      const validation = qrService.validateScanData(data.trim());
      
      if (!validation.valid) {
        // Mostrar error pero permitir continuar
        Alert.alert(
          '⚠️ Formato No Reconocido',
          `${validation.error}\n\n¿Deseas continuar de todos modos?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: 'Continuar', 
              onPress: () => confirmScan(data.trim())
            }
          ]
        );
        return;
      }

      // Mostrar información de lo detectado
      if (validation.type === 'qr') {
        const qrData = validation.data;
        Alert.alert(
          '✅ Código QR Detectado',
          `🚛 Camión: ${qrData.placa}\n🏭 Marca: ${qrData.marca} ${qrData.modelo}\n👤 Piloto: ${qrData.piloto || 'No especificado'}\n📅 Año: ${qrData.año || 'No especificado'}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { 
              text: '✅ Usar Datos', 
              onPress: () => confirmScan(data.trim())
            }
          ]
        );
      } else {
        Alert.alert(
          '✅ Placa Detectada',
          `🚛 Placa: ${validation.placa}${validation.warning ? `\n⚠️ ${validation.warning}` : ''}`,
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: '✅ Confirmar', onPress: () => confirmScan(data.trim()) }
          ]
        );
      }
      
    } catch (error) {
      console.error('Error procesando entrada:', error);
      Alert.alert(
        '❌ Error de Procesamiento',
        'Hubo un problema procesando la entrada. ¿Deseas continuar de todos modos?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => confirmScan(data.trim()) }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  const confirmScan = (data) => {
    onScan(data);
    setInputText('');
    setSuggestions([]);
    Keyboard.dismiss();
    onClose();
  };

  const handleClose = () => {
    setInputText('');
    setSuggestions([]);
    Keyboard.dismiss();
    onClose();
  };

  const generateSampleQR = () => {
    const sampleQR = 'CAMION_QR:{"placa":"P-001AAA","marca":"Volvo","modelo":"FH16","año":2020,"piloto":"Juan Pérez","fechaGeneracion":"2025-10-18T15:30:00Z","tipo":"camion"}';
    setInputText(sampleQR);
    setInputMode('qr');
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion) => {
    setInputText(suggestion);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const formatPlateInput = (text) => {
    // Auto-formatear placas guatemaltecas
    if (inputMode === 'plate') {
      // Remover caracteres no válidos
      let cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      
      // Auto-agregar guión si no existe
      if (cleaned.length >= 2 && !cleaned.includes('-')) {
        if (/^[A-Z]{1,2}$/.test(cleaned)) {
          cleaned = cleaned + '-';
        }
      }
      
      return cleaned;
    }
    return text;
  };

  const switchMode = (mode) => {
    setInputMode(mode);
    setInputText('');
    setSuggestions([]);
    Keyboard.dismiss();
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

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Mode Selector */}
          <View style={styles.modeSelector}>
            <TouchableOpacity 
              style={[styles.modeButton, inputMode === 'plate' && styles.modeButtonActive]}
              onPress={() => switchMode('plate')}
            >
              <Ionicons 
                name="car" 
                size={20} 
                color={inputMode === 'plate' ? COLORS.white : COLORS.transport.primary} 
              />
              <Text style={[
                styles.modeButtonText, 
                inputMode === 'plate' && styles.modeButtonTextActive
              ]}>
                Placa
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modeButton, inputMode === 'qr' && styles.modeButtonActive]}
              onPress={() => switchMode('qr')}
            >
              <Ionicons 
                name="qr-code" 
                size={20} 
                color={inputMode === 'qr' ? COLORS.white : COLORS.transport.primary} 
              />
              <Text style={[
                styles.modeButtonText, 
                inputMode === 'qr' && styles.modeButtonTextActive
              ]}>
                Código QR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons 
                name={inputMode === 'plate' ? "information-circle" : "qr-code-outline"} 
                size={24} 
                color={COLORS.transport.primary} 
              />
              <Text style={styles.infoTitle}>
                {inputMode === 'plate' ? 'Ingreso de Placa' : 'Ingreso de Código QR'}
              </Text>
            </View>
            <Text style={styles.infoText}>
              {inputMode === 'plate' 
                ? 'Ingresa la placa del camión. Formatos válidos: P-001AAA, C-123BBB, TC-456CCC'
                : 'Pega aquí el código QR completo generado por la aplicación'
              }
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>
              {inputMode === 'plate' ? 'Placa del Camión:' : 'Código QR:'}
            </Text>
            
            <TextInput
              style={[
                styles.textInput,
                inputMode === 'qr' && styles.textInputMultiline
              ]}
              value={inputText}
              onChangeText={(text) => {
                const formatted = formatPlateInput(text);
                handleInputChange(formatted);
              }}
              placeholder={inputMode === 'plate' ? "Ej: P-001AAA" : "CAMION_QR:{...}"}
              placeholderTextColor={COLORS.secondary[400]}
              multiline={inputMode === 'qr'}
              autoCapitalize={inputMode === 'plate' ? "characters" : "none"}
              autoCorrect={false}
              maxLength={inputMode === 'plate' ? 10 : 1000}
            />

            {/* Suggestions for plates */}
            {inputMode === 'plate' && suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => selectSuggestion(suggestion)}
                  >
                    <Ionicons name="car" size={16} color={COLORS.transport.primary} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              {inputMode === 'qr' && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={generateSampleQR}
                >
                  <Ionicons name="code-working" size={16} color={COLORS.transport.primary} />
                  <Text style={styles.quickActionText}>QR de Ejemplo</Text>
                </TouchableOpacity>
              )}
              
              {inputMode === 'plate' && (
                <TouchableOpacity 
                  style={styles.quickActionButton}
                  onPress={() => setInputText('P-001AAA')}
                >
                  <Ionicons name="flash" size={16} color={COLORS.transport.primary} />
                  <Text style={styles.quickActionText}>Placa de Ejemplo</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  setInputText('');
                  setSuggestions([]);
                }}
              >
                <Ionicons name="refresh" size={16} color={COLORS.transport.primary} />
                <Text style={styles.quickActionText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.confirmButton, processing && styles.buttonDisabled]}
              onPress={() => validateAndProcess(inputText)}
              disabled={processing || !inputText.trim()}
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

          {/* Help Section */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>💡 Consejos:</Text>
            <Text style={styles.helpText}>
              • Para placas: Usa el formato P-001AAA (letra-guión-números-letras)
            </Text>
            <Text style={styles.helpText}>
              • Para QR: Pega el código completo que empiece con "CAMION_QR:"
            </Text>
            <Text style={styles.helpText}>
              • Usa las sugerencias para completar placas rápidamente
            </Text>
          </View>
        </ScrollView>
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
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    gap: SPACING.xs,
  },
  modeButtonActive: {
    backgroundColor: COLORS.transport.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.transport.primary,
  },
  modeButtonTextActive: {
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.lg,
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
    fontSize: 16,
    color: COLORS.secondary[800],
    backgroundColor: COLORS.white,
  },
  textInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.secondary[50],
    borderRadius: BORDERS.radius.md,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[700],
    marginBottom: SPACING.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.secondary[700],
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
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
  quickActionText: {
    color: COLORS.transport.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: SPACING.sm,
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
  helpSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: SPACING.sm,
  },
  helpText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
});

export default PlateScanner;
