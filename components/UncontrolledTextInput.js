import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { TextInput } from 'react-native';

const UncontrolledTextInput = forwardRef(({ onChangeText, ...props }, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => inputRef.current?.clear(),
    getValue: () => inputRef.current?._lastNativeText || '',
  }));

  const handleChangeText = (text) => {
    if (onChangeText) {
      // Usar setTimeout para evitar que el cambio de estado cause re-render
      setTimeout(() => onChangeText(text), 0);
    }
  };

  return (
    <TextInput
      ref={inputRef}
      onChangeText={handleChangeText}
      autoCorrect={false}
      autoCapitalize="none"
      returnKeyType="search"
      clearButtonMode="while-editing"
      selectTextOnFocus={false}
      {...props}
    />
  );
});

UncontrolledTextInput.displayName = 'UncontrolledTextInput';

export default UncontrolledTextInput;
