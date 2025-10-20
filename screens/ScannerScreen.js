import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Keyboard,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import qrService from '../services/qrService';
import { Card } from '../components/Card';
import { Heading, Body, Caption } from '../components/Typography';
import { Button } from '../components/Button';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const ScannerScreen = ({ navigation, route }) => {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputMode, setInputMode] = useState('plate'); // 'plate' o 'qr'
  const [recentScans, setRecentScans] = useState([]);
  const [validationResult, setValidationResult] = useState(null);

  const { onScanResult } = route.params || {};

  // Placas de ejemplo comunes en Guatemala
  const commonPlates = [
    'P-001AAA', 'P-002BBB', 'P-003CCC', 'P-004DDD', 'P-005EEE',
    'C-123AAA', 'C-456BBB', 'C-789CCC', 'C-012DDD', 'C-345EEE',
    'TC-001AAA', 'TC-002BBB', 'TC-003CCC', 'TC-004DDD', 'TC-005EEE'
  ];

  useEffect(() => {
    // Cargar escaneos recientes
    loadRecentScans();
  }, []);

  const loadRecentScans = () => {
    // Simular escaneos recientes (en producción vendría de AsyncStorage)
    const recent = [
      { id: 1, type: 'plate', value: 'P-001AAA', timestamp: new Date().toISOString() },
      { id: 2, type: 'qr', value: 'CAMION_QR:{...}', timestamp: new Date().toISOString() },
      { id: 3, type: 'plate', value: 'C-123BBB', timestamp: new Date().toISOString() }
    ];
    setRecentScans(recent);
  };

  const handleInputChange = (text) => {
    setInputText(text);
    setValidationResult(null);
    
    // Generar sugerencias en tiempo real
    if (inputMode === 'plate' && text.length > 0) {
      const filtered = commonPlates.filter(plate => 
        plate.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
    } else {
      setSuggestions([]);
    }

    // Validación en tiempo real
    if (text.trim().length > 3) {
      const validation = qrService.validateScanData(text.trim());
      setValidationResult(validation);
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
        confirmScan(data.trim());
      }
      
    } catch (error) {
      console.error('Error procesando entrada:', error);
      Alert.alert('❌ Error', 'Hubo un problema procesando la entrada');
    } finally {
      setProcessing(false);
    }
  };

  const confirmScan = (data) => {
    // Agregar a escaneos recientes
    const newScan = {
      id: Date.now(),
      type: inputMode,
      value: data,
      timestamp: new Date().toISOString()
    };
    setRecentScans(prev => [newScan, ...prev.slice(0, 4)]);

    // Callback al componente padre
    if (onScanResult) {
      onScanResult(data);
    }

    // Limpiar y volver
    setInputText('');
    setSuggestions([]);
    setValidationResult(null);
    Keyboard.dismiss();
    navigation.goBack();
  };

  const selectSuggestion = (suggestion) => {
    setInputText(suggestion);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const selectRecentScan = (scan) => {
    setInputText(scan.value);
    setInputMode(scan.type);
    setSuggestions([]);
  };

  const formatPlateInput = (text) => {
    if (inputMode === 'plate') {
      let cleaned = text.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      
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
    setValidationResult(null);
    Keyboard.dismiss();
  };

  const generateSampleQR = () => {
    const sampleQR = 'CAMION_QR:{"placa":"P-001AAA","marca":"Volvo","modelo":"FH16","año":2020,"piloto":"Juan Pérez","fechaGeneracion":"2025-10-18T15:30:00Z","tipo":"camion"}';
    setInputText(sampleQR);
    setInputMode('qr');
    setSuggestions([]);
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;
    
    if (validationResult.valid) {
      return <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />;
    } else {
      return <Ionicons name="alert-circle" size={24} color={COLORS.warning} />;
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => selectSuggestion(item)}
    >
      <Ionicons name="car" size={16} color={COLORS.transport.primary} />
      <Text style={styles.suggestionText}>{item}</Text>
      <Ionicons name="arrow-forward" size={16} color={COLORS.secondary[400]} />
    </TouchableOpacity>
  );

  const renderRecentScan = ({ item }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => selectRecentScan(item)}
    >
      <View style={styles.recentItemContent}>
        <Ionicons 
          name={item.type === 'plate' ? "car" : "qr-code"} 
          size={20} 
          color={COLORS.transport.primary} 
        />
        <View style={styles.recentItemText}>
          <Text style={styles.recentItemValue} numberOfLines={1}>
            {item.value}
          </Text>
          <Text style={styles.recentItemTime}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
      <Ionicons name="refresh" size={16} color={COLORS.secondary[400]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Heading size="xl" color={COLORS.white} weight="bold">
              🔍 Scanner de Placas
            </Heading>
            <Body size="base" color={COLORS.primary[100]}>
              Ingreso manual optimizado
            </Body>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mode Selector */}
        <Card style={styles.modeCard}>
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
        </Card>

        {/* Input Section */}
        <Card style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Heading size="lg" weight="semibold" color={COLORS.secondary[800]}>
              {inputMode === 'plate' ? '🚛 Placa del Camión' : '📱 Código QR'}
            </Heading>
            {getValidationIcon()}
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.textInput,
                inputMode === 'qr' && styles.textInputMultiline,
                validationResult?.valid && styles.textInputValid,
                validationResult && !validationResult.valid && styles.textInputInvalid
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
            
            {validationResult && (
              <View style={[
                styles.validationMessage,
                validationResult.valid ? styles.validationSuccess : styles.validationError
              ]}>
                <Text style={[
                  styles.validationText,
                  validationResult.valid ? styles.validationTextSuccess : styles.validationTextError
                ]}>
                  {validationResult.valid 
                    ? `✅ ${validationResult.type === 'qr' ? 'Código QR válido' : 'Placa válida'}`
                    : `⚠️ ${validationResult.error.split('\n')[0]}`
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {inputMode === 'qr' && (
              <Button
                variant="outline"
                size="small"
                icon="code-working"
                onPress={generateSampleQR}
                style={styles.quickActionButton}
              >
                QR Ejemplo
              </Button>
            )}
            
            {inputMode === 'plate' && (
              <Button
                variant="outline"
                size="small"
                icon="flash"
                onPress={() => setInputText('P-001AAA')}
                style={styles.quickActionButton}
              >
                Placa Ejemplo
              </Button>
            )}
            
            <Button
              variant="outline"
              size="small"
              icon="refresh"
              onPress={() => {
                setInputText('');
                setSuggestions([]);
                setValidationResult(null);
              }}
              style={styles.quickActionButton}
            >
              Limpiar
            </Button>
          </View>
        </Card>

        {/* Suggestions */}
        {inputMode === 'plate' && suggestions.length > 0 && (
          <Card style={styles.suggestionsCard}>
            <Heading size="md" weight="semibold" color={COLORS.secondary[800]} style={styles.sectionTitle}>
              💡 Sugerencias
            </Heading>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item}
              scrollEnabled={false}
            />
          </Card>
        )}

        {/* Recent Scans */}
        {recentScans.length > 0 && (
          <Card style={styles.recentCard}>
            <Heading size="md" weight="semibold" color={COLORS.secondary[800]} style={styles.sectionTitle}>
              🕒 Escaneos Recientes
            </Heading>
            <FlatList
              data={recentScans}
              renderItem={renderRecentScan}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </Card>
        )}

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Heading size="md" weight="semibold" color={COLORS.secondary[800]} style={styles.sectionTitle}>
            💡 Ayuda
          </Heading>
          <View style={styles.helpContent}>
            <Text style={styles.helpText}>
              • <Text style={styles.helpBold}>Placas:</Text> P-001AAA, C-123BBB, TC-456CCC
            </Text>
            <Text style={styles.helpText}>
              • <Text style={styles.helpBold}>QR:</Text> Pega el código completo que empiece con "CAMION_QR:"
            </Text>
            <Text style={styles.helpText}>
              • <Text style={styles.helpBold}>Sugerencias:</Text> Aparecen automáticamente mientras escribes
            </Text>
            <Text style={styles.helpText}>
              • <Text style={styles.helpBold}>Recientes:</Text> Reutiliza escaneos anteriores
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="large"
          icon="close"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancelar
        </Button>
        
        <Button
          variant="primary"
          size="large"
          icon={processing ? "hourglass" : "checkmark"}
          onPress={() => validateAndProcess(inputText)}
          disabled={processing || !inputText.trim()}
          style={styles.confirmButton}
        >
          {processing ? 'Procesando...' : 'Confirmar'}
        </Button>
      </View>
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  modeCard: {
    marginBottom: SPACING.lg,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary[100],
    borderRadius: BORDERS.radius.lg,
    padding: SPACING.xs,
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
  inputCard: {
    marginBottom: SPACING.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  inputContainer: {
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
  textInputValid: {
    borderColor: COLORS.success,
  },
  textInputInvalid: {
    borderColor: COLORS.warning,
  },
  validationMessage: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
  },
  validationSuccess: {
    backgroundColor: COLORS.success + '20',
  },
  validationError: {
    backgroundColor: COLORS.warning + '20',
  },
  validationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  validationTextSuccess: {
    color: COLORS.success,
  },
  validationTextError: {
    color: COLORS.warning,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
  },
  suggestionsCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.secondary[50],
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary[700],
    fontWeight: '500',
  },
  recentCard: {
    marginBottom: SPACING.lg,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.secondary[50],
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
  },
  recentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  recentItemText: {
    flex: 1,
  },
  recentItemValue: {
    fontSize: 14,
    color: COLORS.secondary[700],
    fontWeight: '500',
  },
  recentItemTime: {
    fontSize: 12,
    color: COLORS.secondary[500],
  },
  helpCard: {
    marginBottom: SPACING.xl,
  },
  helpContent: {
    gap: SPACING.sm,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.secondary[600],
    lineHeight: 20,
  },
  helpBold: {
    fontWeight: '600',
    color: COLORS.secondary[700],
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary[200],
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});

export default ScannerScreen;
