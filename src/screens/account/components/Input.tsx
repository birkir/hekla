import * as React from 'react';
import { View, TextInput, ReturnKeyTypeOptions, Platform } from 'react-native';
import { theme, getVar } from 'styles';
import { observer } from 'mobx-react';
const styles = theme(require('./Input.styl'));

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

@observer
export default class Input extends React.Component<Props> {

  render() {
    const { placeholder, returnKeyType, innerRef, ...rest } = this.props;

    return (
      <View style={[styles.host, styles[`host__${Platform.OS}`]]}>
        <TextInput
          style={[styles.input, styles[`input__${Platform.OS}`]]}
          placeholder={placeholder}
          returnKeyType={returnKeyType}
          underlineColorAndroid={getVar('--tint-bg')}
          placeholderTextColor={getVar('--content-fg-50')}
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
