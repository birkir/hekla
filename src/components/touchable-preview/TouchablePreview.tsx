import * as React from 'react';
import { Platform, View, TouchableHighlight, findNodeHandle } from 'react-native';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import UI from 'stores/UI';
import { getVar } from 'styles';

interface Props {
  children: React.ReactNode;
  component?: TouchableHighlight;
  componentName?: string;
  onPress?: () => void;
  onPressIn?: (number?) => void;
  underlayColor?: string;
  onShowUnderlay?: any;
  onHideUnderlay?: any;
  style?: any;
}

@observer
export default class TouchablePreview extends React.Component<Props> {

  private hostRef = React.createRef() as any;
  private isPressedIn;
  private startTouch;

  @autobind
  async onPress() {
    if (!this.props.onPress) {
      return;
    }

    if (UI.preview.active) {
      return;
    }

    // Proxy onPress
    this.props.onPress();
  }

  @autobind
  async onPressIn() {

    if (Platform.OS === 'ios') {
      if (!this.props.onPressIn) {
        return;
      }
      this.isPressedIn = true;

      UI.setPreviewComponentName(this.props.componentName);

      // Find react tag
      const reactTag = findNodeHandle(this.hostRef.current);

      // Proxy onPressIn
      return this.props.onPressIn(reactTag);
    }

    // Other platforms shouldn't know how to do 3D touch
    return null;
  }

  @autobind
  onTouchStart(e) {
    const { timestamp, pageX, pageY } = e.nativeEvent;
    // Store the timstamp of touch start
    this.startTouch = { timestamp, x: pageX, y: pageY };
  }

  @autobind
  onTouchMove(e) {
    if (!this.startTouch || !this.isPressedIn) {
      return;
    }

    const PREVIEW_DELAY = 350;
    const PREVIEW_MIN_FORCE = 0.125;

    // Extract force and timestamp from nativeEvent
    const { force, timestamp, pageX, pageY } = e.nativeEvent;
    const diff = (timestamp - this.startTouch.timestamp);

    // Get distance of touch movement
    const a = this.startTouch.x - pageX;
    const b = this.startTouch.y - pageY;
    const distance = Math.abs(Math.sqrt((a * a) + (b * b)));

    if (force > PREVIEW_MIN_FORCE && diff > PREVIEW_DELAY) {
      UI.setPreviewActive(true);
    }
  }

  @autobind
  onTouchEnd() {
    // Unset startTouch for blocking further touch movements
    this.startTouch = null;
    this.isPressedIn = false;
    UI.setPreviewActive(false);
  }

  render() {
    const Touchable = (this.props.component || TouchableHighlight) as any;

    return (
      <Touchable
        ref={this.hostRef}
        underlayColor={this.props.underlayColor || getVar('--backdrop')}
        activeOpacity={1}
        {...this.props}
        onPress={this.onPress}
        onPressIn={this.onPressIn}
      >
        <View
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
        >
          {this.props.children}
        </View>
      </Touchable>
    );
  }
}
