import * as React from 'react';
import { View, Text, TouchableOpacity, TouchableNativeFeedback, GestureResponderEvent, Platform, AccessibilityTrait, ActivityIndicator } from 'react-native';
import { theme } from 'styles';
const styles = theme(require('./Button.styl'));

interface Props {
  title: string;
  fill?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  color?: any;
  disabled?: boolean;
  hasTVPreferredFocus?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
}

export default class Button extends React.Component<Props> {

  render() {
    const { title, fill, loading, accessibilityLabel, color, disabled, onPress, hasTVPreferredFocus, testID } = this.props;

    const buttonStyles = [
      styles.button,
      fill && styles.button__fill,
      styles[`button__${Platform.OS}`],
    ];
    const textStyles = [
      styles.text,
      fill && styles.text__fill,
      styles[`text__${Platform.OS}`],
    ];

    const accessibilityTraits: AccessibilityTrait[] = ['button'];

    if (disabled) {
      buttonStyles.push(styles.button__disabled, fill && styles.button__fill__disabled);
      textStyles.push(styles.text__disabled, fill && styles.text__fill_disabled);
      accessibilityTraits.push('disabled');
    }

    const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
    const titleLabel = Platform.OS === 'android' ? title.toLocaleUpperCase() : title;

    return (
      <Touchable
        accessibilityComponentType="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityTraits={accessibilityTraits}
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        {...Platform.OS === 'ios' ? { hasTVPreferredFocus } : {}}
      >
        <View style={buttonStyles} elevation={fill ? 3 : undefined}>
          {loading ? (
            <ActivityIndicator
              style={styles.loading}
              color="white"
            />
          ) : (
            <Text style={textStyles}>
              {titleLabel}
            </Text>
          )}
        </View>
      </Touchable>
    );
  }

}
