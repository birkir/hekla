import * as React from 'react';
import { View, ImageSourcePropType, Image } from 'react-native';
import { theme } from 'styles';
import { ColorProperty } from 'csstype';
const styles = theme(require('./CellIcon.styl'));

interface Props {
  key?: string;
  source?: ImageSourcePropType;
  size?: number;
  backgroundColor?: ColorProperty;
  tintColor?: ColorProperty;
  testID?: string;
}

export default class CellIcon extends React.PureComponent<Props, any> {

  render() {
    const { source, backgroundColor, size = 26, tintColor = '#ffffff', ...rest } = this.props;

    return (
      <View style={[styles.host, { backgroundColor }]}>
        <Image source={source} resizeMode="center" style={[styles.host__image, { tintColor, maxWidth: size, maxHeight: size }]} {...rest} />
      </View>
    );
  }
}
