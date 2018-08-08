import * as React from 'react';
import { Text } from 'react-native';
import { theme } from 'styles';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import UI from 'stores/UI';
const styles = theme(require('./Link.styl'));

interface Props {
  children?: React.ReactNode;
  testID?: string;
}

@observer
export default class Link extends React.Component<Props> {

  @autobind
  onPress() {
    const url = String(this.props.children).trim();
    UI.openURL(url);
  }

  render() {
    const { children } = this.props;
    return (
      <Text onPress={this.onPress} style={[styles.host, UI.font(15)]}>
        {children}
      </Text>
    );
  }
}
