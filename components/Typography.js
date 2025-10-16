import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/Design';

export const Heading = ({ 
  children, 
  level = 1, 
  color = COLORS.secondary[900], 
  style, 
  ...props 
}) => {
  const headingStyles = [
    styles.base,
    styles[`h${level}`],
    { color },
    style,
  ];

  return (
    <Text style={headingStyles} {...props}>
      {children}
    </Text>
  );
};

export const Body = ({ 
  children, 
  size = 'base', 
  weight = 'normal',
  color = COLORS.secondary[700], 
  style, 
  ...props 
}) => {
  const bodyStyles = [
    styles.base,
    {
      fontSize: TYPOGRAPHY.sizes[size],
      fontWeight: TYPOGRAPHY.weights[weight],
      color,
    },
    style,
  ];

  return (
    <Text style={bodyStyles} {...props}>
      {children}
    </Text>
  );
};

export const Caption = ({ 
  children, 
  color = COLORS.secondary[500], 
  style, 
  ...props 
}) => {
  const captionStyles = [
    styles.base,
    styles.caption,
    { color },
    style,
  ];

  return (
    <Text style={captionStyles} {...props}>
      {children}
    </Text>
  );
};

export const Label = ({ 
  children, 
  color = COLORS.secondary[600], 
  style, 
  ...props 
}) => {
  const labelStyles = [
    styles.base,
    styles.label,
    { color },
    style,
  ];

  return (
    <Text style={labelStyles} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
  },
  
  h1: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.lineHeights.tight * TYPOGRAPHY.sizes['4xl'],
  },
  
  h2: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: TYPOGRAPHY.lineHeights.tight * TYPOGRAPHY.sizes['3xl'],
  },
  
  h3: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.snug * TYPOGRAPHY.sizes['2xl'],
  },
  
  h4: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: TYPOGRAPHY.lineHeights.snug * TYPOGRAPHY.sizes.xl,
  },
  
  h5: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.lg,
  },
  
  h6: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.base,
  },
  
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.normal,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.xs,
  },
  
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: TYPOGRAPHY.lineHeights.normal * TYPOGRAPHY.sizes.sm,
  },
});

export default { Heading, Body, Caption, Label };
