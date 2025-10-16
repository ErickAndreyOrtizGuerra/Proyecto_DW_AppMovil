import React, { Component } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDERS } from '../constants/Design';

const { width } = Dimensions.get('window');

class FloatingSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      searchValue: ''
    };
    this.animatedValue = new Animated.Value(0);
  }

  handleFocus = () => {
    this.setState({ isFocused: true });
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start();
  };

  handleBlur = () => {
    this.setState({ isFocused: false });
    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false
    }).start();
  };

  handleChangeText = (text) => {
    this.setState({ searchValue: text });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  render() {
    const { placeholder = "Buscar...", style } = this.props;
    const { isFocused, searchValue } = this.state;

    const containerStyle = {
      borderColor: this.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [COLORS.secondary[300], COLORS.transport.primary]
      }),
      backgroundColor: COLORS.white,
      shadowOpacity: this.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.2]
      })
    };

    return (
      <Animated.View style={[styles.container, containerStyle, style]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? COLORS.transport.primary : COLORS.secondary[400]} 
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.secondary[400]}
          value={searchValue}
          onChangeText={this.handleChangeText}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          clearButtonMode="while-editing"
          selectionColor={COLORS.transport.primary}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity 
            onPress={() => this.handleChangeText('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.secondary[400]} />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDERS.radius.lg,
    borderWidth: BORDERS.width.thin,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary[800],
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
  },
  clearButton: {
    padding: SPACING.xs,
  }
});

export default FloatingSearch;
