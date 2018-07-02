import * as React from 'react';
import { View, TextInput, ReturnKeyTypeOptions } from 'react-native';
const styles = require('./Input.styl');

interface Props {
  icon?: any;
  placeholder?: string;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  testID?: string;
  innerRef?: (ref: any) => void;
}

export default class Input extends React.PureComponent<Props> {

  render() {
    const { placeholder, returnKeyType, innerRef, ...rest } = this.props;

    return (
      <View style={styles.input}>
        <TextInput
          style={styles.textinput}
          placeholder={placeholder}
          returnKeyType={returnKeyType}
          underlineColorAndroid="transparent"
          blurOnSubmit={false}
          autoFocus={false}
          autoCorrect={false}
          autoCapitalize="none"
          ref={innerRef}
          {...rest}
        />
      </View>
    );
  }
}
