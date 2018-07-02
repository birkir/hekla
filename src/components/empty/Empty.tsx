import * as React from 'react';
import { View, Text } from 'react-native';
import { observer } from 'mobx-react';
const styles = require('./Empty.styl');

interface Props {
  key?: string;
  message: string;
}

@observer
export default class Empty extends React.Component<Props> {
  render() {
    const { message } = this.props;
    return (
      <View style={styles.host}>
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }
}
