import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Body } from './Typography';
import { COLORS, SPACING, BORDERS, SHADOWS, GRADIENTS } from '../constants/Design';

export const Button = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}) => {
  const buttonConfig = getButtonConfig(variant, size);
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    buttonConfig.container,
    isDisabled && styles.disabled,
    style,
  ];

  const textColor = isDisabled ? COLORS.secondary[400] : buttonConfig.textColor;
  const iconColor = isDisabled ? COLORS.secondary[400] : buttonConfig.iconColor;

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={iconColor} 
          style={styles.loader} 
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={buttonConfig.iconSize} 
          color={iconColor} 
          style={styles.iconLeft} 
        />
      )}
      <Body 
        size={buttonConfig.textSize} 
        weight="semibold" 
        color={textColor}
        style={textStyle}
      >
        {children}
      </Body>
      {!loading && icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={buttonConfig.iconSize} 
          color={iconColor} 
          style={styles.iconRight} 
        />
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        style={[styles.base, buttonConfig.container, isDisabled && styles.disabled, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? [COLORS.secondary[300], COLORS.secondary[300]] : buttonConfig.gradient}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const getButtonConfig = (variant, size) => {
  const configs = {
    primary: {
      container: {
        backgroundColor: COLORS.primary[600],
        ...SHADOWS.medium,
      },
      textColor: COLORS.white,
      iconColor: COLORS.white,
      gradient: GRADIENTS.primary,
    },
    secondary: {
      container: {
        backgroundColor: COLORS.secondary[100],
        borderWidth: BORDERS.width.thin,
        borderColor: COLORS.secondary[300],
      },
      textColor: COLORS.secondary[700],
      iconColor: COLORS.secondary[600],
    },
    outline: {
      container: {
        backgroundColor: COLORS.transparent,
        borderWidth: BORDERS.width.thick,
        borderColor: COLORS.primary[600],
      },
      textColor: COLORS.primary[600],
      iconColor: COLORS.primary[600],
    },
    ghost: {
      container: {
        backgroundColor: COLORS.transparent,
      },
      textColor: COLORS.primary[600],
      iconColor: COLORS.primary[600],
    },
    success: {
      container: {
        backgroundColor: COLORS.success[500],
        ...SHADOWS.medium,
      },
      textColor: COLORS.white,
      iconColor: COLORS.white,
      gradient: [COLORS.success[600], COLORS.success[500]],
    },
    warning: {
      container: {
        backgroundColor: COLORS.warning[500],
        ...SHADOWS.medium,
      },
      textColor: COLORS.white,
      iconColor: COLORS.white,
      gradient: [COLORS.warning[600], COLORS.warning[500]],
    },
    error: {
      container: {
        backgroundColor: COLORS.error[500],
        ...SHADOWS.medium,
      },
      textColor: COLORS.white,
      iconColor: COLORS.white,
      gradient: [COLORS.error[600], COLORS.error[500]],
    },
    gradient: {
      container: {
        ...SHADOWS.large,
      },
      textColor: COLORS.white,
      iconColor: COLORS.white,
      gradient: GRADIENTS.primary,
    },
  };

  const sizeConfigs = {
    small: {
      container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDERS.radius.md,
      },
      textSize: 'sm',
      iconSize: 16,
    },
    medium: {
      container: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: BORDERS.radius.lg,
      },
      textSize: 'base',
      iconSize: 20,
    },
    large: {
      container: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        borderRadius: BORDERS.radius.xl,
      },
      textSize: 'lg',
      iconSize: 24,
    },
  };

  return {
    ...configs[variant],
    ...sizeConfigs[size],
  };
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDERS.radius.lg,
  },
  
  loader: {
    marginRight: SPACING.sm,
  },
  
  iconLeft: {
    marginRight: SPACING.sm,
  },
  
  iconRight: {
    marginLeft: SPACING.sm,
  },
});

export default Button;
