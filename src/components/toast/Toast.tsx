import * as React from 'react';
import { Text, Animated, Image } from 'react-native';
const styles = require('./Toast.styl');

interface Props {
  testID?: string;
  message?: string;
  visible?: boolean;
  icon?: any;
}

export default class Toast extends React.PureComponent<Props> {

  translateY = new Animated.Value(Number(this.props.visible));

  componentWillReceiveProps(newProps) {
    if (newProps.visible !== this.props.visible) {
      Animated.spring(this.translateY, {
        toValue: Number(newProps.visible),
      }).start();
    }
  }

  render() {
    const { message, icon } = this.props;
    const translateY = this.translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [-60, 0],
    });

    return (
      <Animated.View style={[styles.host, { transform: [{ translateY }] }]}>
        {icon && (
          <Image source={icon} style={styles.icon} />
        )}
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    );
  }
}
