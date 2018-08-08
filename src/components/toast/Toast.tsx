import * as React from 'react';
import { Text, Animated, Image } from 'react-native';
const styles = require('./Toast.styl');

interface Props {
  testID?: string;
  message?: string;
  visible?: boolean;
  top?: number;
  bottom?: number;
  icon?: any;
}

export default class Toast extends React.PureComponent<Props> {

  opacity = new Animated.Value(Number(this.props.visible));
  translateY = new Animated.Value(Number(this.props.visible));

  componentWillReceiveProps(newProps) {
    if (newProps.visible !== this.props.visible) {
      Animated.spring(this.translateY, {
        speed: 2,
        bounciness: 0,
        toValue: Number(newProps.visible),
      }).start((() => {
        this.opacity.setValue(Number(newProps.visible));
      }));
    }
  }

  render() {
    const { top, bottom, message, icon } = this.props;
    const translateY = this.translateY.interpolate({
      inputRange: [0, 1],
      outputRange: [top ? -120 : 120, 0],
    });
    const opacity = this.opacity;

    return (
      <Animated.View style={[styles.host, { top, bottom, opacity, transform: [{ translateY }] }]}>
        {icon && (
          <Image source={icon} style={styles.icon} />
        )}
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    );
  }
}
