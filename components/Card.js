import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDERS, SPACING } from '../constants/Design';

export const Card = ({ 
  children, 
  style, 
  shadow = 'medium',
  padding = 'lg',
  radius = 'xl',
  backgroundColor = COLORS.white,
  onPress,
  ...props 
}) => {
  const cardStyle = [
    styles.card,
    SHADOWS[shadow],
    {
      padding: SPACING[padding],
      borderRadius: BORDERS.radius[radius],
      backgroundColor,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

export const GradientCard = ({ 
  children, 
  style, 
  colors = [COLORS.primary[600], COLORS.primary[500]],
  shadow = 'large',
  padding = 'lg',
  radius = 'xl',
  onPress,
  ...props 
}) => {
  const cardStyle = [
    styles.card,
    SHADOWS[shadow],
    {
      borderRadius: BORDERS.radius[radius],
    },
    style,
  ];

  const gradientStyle = {
    borderRadius: BORDERS.radius[radius],
    padding: SPACING[padding],
  };

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8} {...props}>
        <LinearGradient colors={colors} style={gradientStyle}>
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      <LinearGradient colors={colors} style={gradientStyle}>
        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
  },
});

export default Card;
