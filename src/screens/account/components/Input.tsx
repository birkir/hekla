import * as React from 'react';
import { View, TextInput, ReturnKeyTypeOptions } from 'react-native';
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
      <View style={styles.input}>
        <TextInput
          style={styles.textinput}
          placeholder={placeholder}
          returnKeyType={returnKeyType}
          underlineColorAndroid={getVar('--primary-color')}
          placeholderTextColor={getVar('--content-text-lighter-color', 'black')}
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
