import React, { Component } from 'react';
import { 
  View, 
  TextInput, 
  Text,
  StyleSheet,
  Platform
} from 'react-native';

class StableFormInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      isFocused: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value && this.props.value !== this.state.value) {
      this.setState({ value: this.props.value || '' });
    }
  }

  handleChangeText = (text) => {
    this.setState({ value: text });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  handleFocus = () => {
    this.setState({ isFocused: true });
    if (this.props.onFocus) {
      this.props.onFocus();
    }
  };

  handleBlur = () => {
    this.setState({ isFocused: false });
    if (this.props.onBlur) {
      this.props.onBlur();
    }
  };

  render() {
    const { 
      label, 
      placeholder, 
      multiline = false,
      numberOfLines = 1,
      keyboardType = 'default',
      autoCapitalize = 'none',
      style,
      ...otherProps 
    } = this.props;
    
    const { value, isFocused } = this.state;

    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
        <TextInput
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            multiline && styles.multilineInput
          ]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          onChangeText={this.handleChangeText}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={multiline ? "default" : "next"}
          {...otherProps}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});

export default StableFormInput;
