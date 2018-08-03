import * as React from 'react';
import { View, Text } from 'react-native';
import { observer } from 'mobx-react';
const styles = require('./IPad.styl');

interface Props {
  componentId?: string;
  testID?: string;
}

@observer
export default class IPadScreen extends React.Component<Props> {

  render() {
    const { testID } = this.props;

    return (
      <View style={styles.host} testID={testID}>
        <Text style={styles.text}>Select a story from the sidebar</Text>
      </View>
    );
  }
}
