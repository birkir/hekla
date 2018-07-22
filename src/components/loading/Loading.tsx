import * as React from 'react';
import { View, Platform, ActivityIndicator } from 'react-native';
import { getVar } from 'styles';
const styles = require('./Loading.styl');

interface Props {
  previewing?: boolean;
  visible?: boolean;
  end?: boolean;
  delay?: number;
  testID?: string;
}

export default class Loading extends React.PureComponent<Props> {

  private delayTimer;

  state = {
    visible: this.props.visible,
  } as any;

  componentDidMount() {
    const { delay = 150 } = this.props;
    this.delayTimer = setTimeout(
      () => this.setState({
        visible: true,
      }),
      delay,
    );
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      visible: newProps.visible,
    });
  }

  componentWillUnmount() {
    clearTimeout(this.delayTimer);
  }

  render() {
    const { visible } = this.state;
    const { previewing, end } = this.props;

    if (!visible) {
      return null;
    }

    const hostStyles = [
      styles.loading,
      end && styles.loading__end,
      previewing && styles.loading__preview,
    ];

    return (
      <View style={hostStyles}>
        <ActivityIndicator
          color={Platform.OS === 'android' ? getVar('--tint-bg') : undefined}
        />
      </View>
    );
  }
}
