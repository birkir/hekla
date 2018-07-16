import * as React from 'react';
import { TextInput, View, Image } from 'react-native';
const styles = require('./SearchInput.styl');

interface Props {
  onChangeText: (string) => void;
  onFocus: () => void;
  onBlur: () => void;
}

export default class SearchInput extends React.Component<Props, any> {

  private textInput = React.createRef() as any;

  render() {
    return (
      <View style={styles.host} elevation={3}>
        <Image
          source={require('assets/icons/25/search.png')}
          style={styles.icon__search}
        />
        <TextInput
          autoCorrect={false}
          ref={this.textInput}
          underlineColorAndroid="transparent"
          style={styles.input}
          {...this.props}
        />
      </View>
    );
  }
}
