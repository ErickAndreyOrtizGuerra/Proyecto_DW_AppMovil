import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import transporteApi from '../services/transporteApi';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('saved_email');
      const savedPassword = await AsyncStorage.getItem('saved_password');
      const rememberUser = await AsyncStorage.getItem('remember_me');
      
      if (savedEmail && rememberUser === 'true') {
        setEmail(savedEmail);
        setRememberMe(true);
        if (savedPassword) {
          setPassword(savedPassword);
        }
      }
    } catch (error) {
      console.error('Error cargando credenciales guardadas:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('❌ Campos Requeridos', 'Por favor ingresa email y contraseña');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('❌ Email Inválido', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      
      // Intentar login con la API
      const response = await transporteApi.login(email.trim(), password);
      
      if (response.success) {
        // Usar el contexto de autenticación para manejar el login
        const loginSuccess = await login(response.user, response.token);
        
        if (loginSuccess) {
          // Guardar credenciales si "Recordarme" está activado
          if (rememberMe) {
            await AsyncStorage.setItem('saved_email', email.trim());
            await AsyncStorage.setItem('saved_password', password);
            await AsyncStorage.setItem('remember_me', 'true');
          } else {
            await AsyncStorage.removeItem('saved_email');
            await AsyncStorage.removeItem('saved_password');
            await AsyncStorage.setItem('remember_me', 'false');
          }

          Alert.alert(
            '✅ Bienvenido',
            `Hola ${response.user.name || response.user.email}!\nSesión iniciada correctamente.`,
            [{ text: 'Perfecto', style: 'default' }]
          );
          
          // El contexto se encargará automáticamente de la navegación
        } else {
          Alert.alert('❌ Error', 'No se pudo guardar la sesión');
        }
      } else {
        Alert.alert('❌ Error de Autenticación', response.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      Alert.alert(
        '❌ Error de Conexión',
        'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      '🔐 Recuperar Contraseña',
      'Contacta al administrador del sistema para recuperar tu contraseña.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const status = await transporteApi.getApiStatus();
      Alert.alert(
        '✅ Conexión Exitosa',
        `Servidor funcionando correctamente\n\nEstado: ${status.message}\nVersión: ${status.laravel_version}`,
        [{ text: 'Perfecto', style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error de Conexión',
        'No se pudo conectar con el servidor. Verifica la conexión a internet.',
        [{ text: 'Entendido', style: 'default' }]
      );
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
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>
            
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.secondary[400]} 
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            >
              <Ionicons 
                name={rememberMe ? "checkbox" : "square-outline"} 
                size={20} 
                color={COLORS.transport.primary} 
              />
              <Text style={styles.rememberText}>Recordarme</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={testConnection}
            disabled={loading}
          >
            <Ionicons name="wifi" size={16} color={COLORS.secondary[300]} />
            <Text style={styles.testText}>Probar Conexión</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>
            v1.0.0 - Sistema de Gestión de Transportes
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
    flex: 0.4,
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
  },
  formContainer: {
    flex: 0.5,
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
    marginBottom: SPACING.xl,
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
  eyeIcon: {
    padding: SPACING.xs,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  rememberText: {
    marginLeft: SPACING.sm,
    fontSize: 14,
    color: COLORS.secondary[600],
  },
  loginButton: {
    backgroundColor: COLORS.transport.primary,
    borderRadius: BORDERS.radius.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotButton: {
    alignItems: 'center',
  },
  forgotText: {
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
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  testText: {
    marginLeft: SPACING.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
