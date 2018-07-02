import * as React from 'react';
import { View, ImageSourcePropType, Image } from 'react-native';
import { theme } from 'styles';
import { ColorProperty } from 'csstype';
const styles = theme(require('./CellIcon.styl'));

interface Props {
  key?: string;
  source?: ImageSourcePropType;
  backgroundColor?: ColorProperty;
  tintColor?: ColorProperty;
  testID?: string;
}

export default class CellIcon extends React.PureComponent<Props, any> {

  render() {
    const { source, backgroundColor, tintColor, ...rest } = this.props;

    return (
      <View style={[styles.host, { backgroundColor }]}>
        <Image source={source} style={[styles.host__image, { tintColor }]} {...rest} />
      </View>
    );
  }
}
