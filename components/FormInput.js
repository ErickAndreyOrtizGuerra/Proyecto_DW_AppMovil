import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Caption } from './Typography';
import { COLORS, SPACING, BORDERS, TYPOGRAPHY } from '../constants/Design';

const FormInput = React.memo(({ 
  label,
  value, 
  onChangeText, 
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'none',
  returnKeyType = 'next',
  style,
  inputStyle,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Caption color={COLORS.secondary[600]} style={styles.label}>
          {label}
        </Caption>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          inputStyle
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.secondary[400]}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        autoCorrect={false}
        blurOnSubmit={false}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    marginBottom: SPACING.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  input: {
    borderWidth: BORDERS.width.thin,
    borderColor: COLORS.secondary[300],
    borderRadius: BORDERS.radius.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[800],
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

FormInput.displayName = 'FormInput';

export default FormInput;
