import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colores del sistema de diseño
export const COLORS = {
  // Colores primarios
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // Colores secundarios
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Estados
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  
  // Colores específicos por módulo
  transport: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    light: '#EFF6FF',
  },
  
  fuel: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    light: '#FFFBEB',
  },
  
  movement: {
    primary: '#059669',
    secondary: '#10B981',
    light: '#ECFDF5',
  },
  
  report: {
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    light: '#F3E8FF',
  },
  
  // Grises
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Tipografía
export const TYPOGRAPHY = {
  // Tamaños de fuente
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Pesos de fuente
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Alturas de línea
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

// Bordes y radios
export const BORDERS = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    '3xl': 24,
    full: 9999,
  },
  
  width: {
    hairline: 0.5,
    thin: 1,
    thick: 2,
    thicker: 4,
  },
};

// Sombras
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Dimensiones de pantalla
export const SCREEN = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 414,
  isLarge: width >= 414,
};

// Gradientes predefinidos
export const GRADIENTS = {
  primary: [COLORS.primary[600], COLORS.primary[500]],
  secondary: [COLORS.secondary[600], COLORS.secondary[500]],
  success: [COLORS.success[600], COLORS.success[500]],
  warning: [COLORS.warning[600], COLORS.warning[500]],
  error: [COLORS.error[600], COLORS.error[500]],
  transport: [COLORS.transport.primary, COLORS.transport.secondary],
  fuel: [COLORS.fuel.primary, COLORS.fuel.secondary],
  movement: [COLORS.movement.primary, COLORS.movement.secondary],
  report: [COLORS.report.primary, COLORS.report.secondary],
};

// Animaciones
export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDERS,
  SHADOWS,
  SCREEN,
  GRADIENTS,
  ANIMATIONS,
};
