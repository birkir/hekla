import * as React from 'react';
import { Text, Animated, Image, View, Slider, Platform } from 'react-native';
import { theme } from 'styles';
import { observer } from 'mobx-react';
const styles = theme(require('./SliderFontSize.styl'));

interface Props {
  testID?: string;
  value: any;
  disabled?: boolean;
  onValueChange: (GestureResponderEvent) => void;
}

@observer
export default class SliderFontSize extends React.Component<Props> {

  render() {
    const { disabled = false } = this.props;
    return (
      <View style={[styles.host, disabled && styles.host__disabled]}>
        <View style={styles.end}>
          <Text style={styles.end__small}>A</Text>
        </View>
        <View style={styles.content}>
         <View style={styles.track}>
            {Array.from({ length: 7 }).map((_, index) => (
              <View key={index} style={[styles.track__tick, { left: `${index / 6 * 100}%` }]} />
            ))}
          </View>
          <Slider
            minimumTrackTintColor="transparent"
            maximumTrackTintColor="transparent"
            step={1}
            value={this.props.value}
            minimumValue={0}
            maximumValue={6}
            onValueChange={this.props.onValueChange}
            disabled={disabled}
            style={Platform.select({ ios: styles.slider__ios, android: styles.slider__android })}
          />
        </View>
        <View style={styles.end}>
          <Text style={styles.end__large}>A</Text>
        </View>
      </View>
    );
  }
}
