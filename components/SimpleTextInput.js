import React, { Component } from 'react';
import { TextInput } from 'react-native';

class SimpleTextInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  handleChangeText = (text) => {
    this.setState({ text });
    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  render() {
    const { onChangeText, ...otherProps } = this.props;
    
    return (
      <TextInput
        {...otherProps}
        onChangeText={this.handleChangeText}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
    );
  }
}

export default SimpleTextInput;
