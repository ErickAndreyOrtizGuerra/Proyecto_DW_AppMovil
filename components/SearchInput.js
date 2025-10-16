import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/Design';

const SearchInput = React.memo(({ 
  value, 
  onChangeText, 
  placeholder = "Buscar...",
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={COLORS.secondary[400]} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.secondary[400]}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        blurOnSubmit={false}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[700],
    paddingVertical: SPACING.xs,
  },
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
