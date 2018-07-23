import * as React from 'react';
import { View, TouchableHighlight, findNodeHandle, Platform } from 'react-native';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import UI from 'stores/UI';
import { getVar } from 'styles';

interface Props {
  children: React.ReactNode;
  onPress: () => void;
  onPressIn: (number?) => void;
  underlayColor?: string;
  onShowUnderlay?: any;
  onHideUnderlay?: any;
  style?: any;
}

@observer
export default class TouchablePreview extends React.Component<Props> {

  private previousComponentId;
  private commitTimeout;
  private startTimestamp: number = 0;
  private hostRef = React.createRef() as any;

  @observable
  preview = false;

  @observable
  active = false;

  @autobind
  async onPress() {
    if (this.preview) {
      UI.setComponentId(this.previousComponentId);
      return;
    }

    this.props.onPress();
  }

  @autobind
  async onPressIn() {
    if (Platform.OS !== 'ios') {
      return;
    }

    this.props.onPressIn(findNodeHandle(this.hostRef.current));
  }

  @autobind
  onHostPressIn() {
    // Store current componentId for rollback on cancel
    this.previousComponentId = UI.componentId;
    this.active = true;
  }

  @autobind
  onTouchStart(e) {
    // Store the timstamp of touch start
    this.startTimestamp = e.nativeEvent.timestamp;
  }

  @autobind
  onTouchMove(e) {
    const PREVIEW_DELAY = 350;
    const PREVIEW_MIN_FORCE = 0.1;
    const PREVIEW_MAX_FORCE = 0.75;

    if (!this.active) {
      return;
    }

    // Clear timout for movement (or deeper presses)
    clearTimeout(this.commitTimeout);

    // Extract force and timestamp from nativeEvent
    const { force, timestamp } = e.nativeEvent;
    const diff = (timestamp - this.startTimestamp);

    if (force > 0.1 && diff > 350) {
      this.onPreviewIn();
    }

    if (force > 0.75) {
      this.commitTimeout = setTimeout(
        () => {
          this.onPreviewOut();
        },
        1000,
      );
    }
  }

  @autobind
  onTouchEnd() {
    // Clear commit timeout
    clearTimeout(this.commitTimeout);
    // Cancel preview
    setTimeout(this.onPreviewOut, 1);
  }

  @autobind
  onPreviewIn() {
    if (this.preview === false) {
      this.preview = true;
      const reactTag = findNodeHandle(this.hostRef.current);
      this.props.onPressIn(reactTag);
      UI.setPreview({ active: true });
    }
  }

  @autobind
  onPreviewOut() {
    this.preview = false;
    this.active = false;
    UI.setPreview({ active: false });
  }

  render() {
    return (
      <TouchableHighlight
        ref={this.hostRef}
        underlayColor={this.props.underlayColor || getVar('--backdrop')}
        activeOpacity={1}
        {...this.props}
        onPress={this.onPress}
        onPressIn={this.onHostPressIn}
      >
        <View
          onTouchStart={this.onTouchStart}
          onTouchMove={this.onTouchMove}
          onTouchEnd={this.onTouchEnd}
        >
          {this.props.children}
        </View>
      </TouchableHighlight>
    );
  }
}
