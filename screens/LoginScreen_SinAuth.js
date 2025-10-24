import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width, height } = Dimensions.get('window');

const LoginScreenSinAuth = ({ navigation }) => {
  const [email, setEmail] = useState('admin@transportes.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('❌ Campos Requeridos', 'Por favor ingresa email y contraseña');
      return;
    }

    // Validar credenciales localmente (temporal)
    const validUsers = [
      { email: 'admin@transportes.com', password: 'admin123', name: 'Admin', role: 'admin' },
      { email: 'operativo@transportes.com', password: 'operativo123', name: 'Operativo', role: 'operativo' },
      { email: 'piloto@transportes.com', password: 'piloto123', name: 'Piloto', role: 'piloto' }
    ];

    const user = validUsers.find(u => u.email === email.trim() && u.password === password);

    if (user) {
      Alert.alert(
        '✅ Login Simulado',
        `¡Bienvenido ${user.name}!\n\n⚠️ NOTA: Login temporal mientras se arregla el servidor.\n\nTodas las funciones CRUD funcionarán normalmente.`,
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Navegar a la pantalla principal
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          }
        ]
      );
    } else {
      Alert.alert('❌ Credenciales Incorrectas', 'Email o contraseña incorrectos');
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://transportes-ultrarapidos-api.uc.r.appspot.com/api/test');
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          '✅ API Funcionando',
          `Servidor activo\n\n${data.message}\nVersión: ${data.laravel_version}\n\n⚠️ El problema es específico del endpoint /login`,
          [{ text: 'Entendido', style: 'default' }]
        );
      } else {
        Alert.alert('❌ API No Disponible', `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      Alert.alert('❌ Sin Conexión', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.transport.primary, COLORS.transport.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={60} color="white" />
          </View>
          <Text style={styles.title}>Transportes Ultrarrápidos</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Móvil</Text>
          <Text style={styles.warningText}>⚠️ Modo Sin Servidor (Temporal)</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
            {/* Warning */}
            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
              <Text style={styles.warningBoxText}>
                El servidor tiene problemas. Usando validación local temporal.
              </Text>
            </View>
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={COLORS.secondary[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.secondary[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={COLORS.secondary[400]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={COLORS.secondary[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Credentials Helper */}
            <View style={styles.credentialsBox}>
              <Text style={styles.credentialsTitle}>👤 Usuarios Disponibles:</Text>
              <Text style={styles.credentialsText}>• admin@transportes.com / admin123</Text>
              <Text style={styles.credentialsText}>• operativo@transportes.com / operativo123</Text>
              <Text style={styles.credentialsText}>• piloto@transportes.com / piloto123</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              <Ionicons name="log-in" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.loginButtonText}>Iniciar Sesión (Temporal)</Text>
            </TouchableOpacity>

            {/* Test Connection */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={testConnection}
              disabled={loading}
            >
              <Ionicons name="wifi" size={16} color={COLORS.transport.primary} />
              <Text style={styles.testButtonText}>Probar Conexión API</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>
            v1.0.0 - Modo Temporal Sin Servidor
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xl * 2,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  warningText: {
    fontSize: 14,
    color: '#FEF3C7',
    textAlign: 'center',
    fontWeight: '600',
  },
  formContainer: {
    flex: 0.55,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: BORDERS.radius.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.secondary[800],
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.lg,
  },
  warningBoxText: {
    marginLeft: SPACING.sm,
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    borderRadius: BORDERS.radius.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary[200],
  },
  inputIcon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.secondary[800],
  },
  credentialsBox: {
    backgroundColor: COLORS.secondary[50],
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.lg,
  },
  credentialsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[700],
    marginBottom: SPACING.xs,
  },
  credentialsText: {
    fontSize: 12,
    color: COLORS.secondary[600],
    marginBottom: 2,
  },
  loginButton: {
    backgroundColor: COLORS.transport.primary,
    borderRadius: BORDERS.radius.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  testButtonText: {
    marginLeft: SPACING.xs,
    color: COLORS.transport.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SPACING.lg,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default LoginScreenSinAuth;
