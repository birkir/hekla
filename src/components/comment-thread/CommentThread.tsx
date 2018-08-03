import * as React from 'react';
import { View, Image, Animated, LayoutAnimation, StyleSheet } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Interactable from 'react-native-interactable';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import { replyScreen } from 'screens';
import UI from 'stores/UI';
import Comment from 'components/comment/Comment';
import { theme } from 'styles';
const styles = theme(require('./CommentThread.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
  depth: number;
  collapsed: boolean;
  hidden: boolean;
  onCollapse: (item: any) => void;
  onExpand: (item: any) => void;
  testID?: string;
}

interface State {
  isActionLeftActive: boolean;
  isActionRightActive: boolean;
}

export default class CommentThread extends React.PureComponent<Props, State> {

  private deltaX = new Animated.Value(0);

  state = {
    isActionLeftActive: false,
    isActionRightActive: false,
  } as State;

  @autobind
  onPress() {
    if (!this.props.collapsed) {
      this.props.onCollapse(this.props.item);
    } else {
      this.props.onExpand(this.props.item);
    }
  }

  @autobind
  onAlert({ nativeEvent: { left, right } }: any) {
    if (left === 'enter') {
      ReactNativeHapticFeedback.trigger('impactLight', true);
      this.setState({ isActionLeftActive: true });
    } else if (right === 'leave') {
      ReactNativeHapticFeedback.trigger('impactLight', true);
      this.setState({ isActionRightActive: true });
    } else {
      this.setState({
        isActionLeftActive: false,
        isActionRightActive: false,
      });
    }
  }

  @autobind
  onDrag({ nativeEvent }) {
    if (nativeEvent.state === 'end') {
      if (this.state.isActionLeftActive) {
        this.onActionLeftToggle();
      }
      if (this.state.isActionRightActive) {
        this.onActionRightToggle();
      }
    }
  }

  @autobind
  onActionLeftToggle() {
    this.props.item.vote();
  }

  @autobind
  onActionRightToggle() {
    setTimeout(() => replyScreen(this.props.item.id), 225);
  }

  render() {
    const { isActionLeftActive, isActionRightActive } = this.state;
    const { hidden, collapsed, depth, item } = this.props;

    if (!item.by || hidden) {
      return null;
    }

    const dragDistance = 100;
    const actionWidth = 50;
    const damping = 1 - 0.6;
    const tension = 300;

    return (
      <View style={styles.host}>
        <Animated.View
          style={[
            styles.action,
            styles.action__left,
            isActionLeftActive && styles.action__left__active,
            hidden ? { opacity: 0, backgroundColor: 'transparent' } : {},
            {
              width: UI.layout.width,
              paddingLeft: dragDistance + actionWidth,
              transform: [{
                translateX: this.deltaX.interpolate({
                  inputRange: [0, dragDistance],
                  outputRange: [-dragDistance, 0],
                  extrapolate: 'clamp',
                }),
              }],
            },
          ]}
        >
          <Image source={require('assets/icons/32/arrow-up.png')} style={{ tintColor: '#FFF' }} />
        </Animated.View>
        <Animated.View
          style={[
            styles.action,
            styles.action__right,
            isActionRightActive && styles.action__right__active,
            hidden ? { opacity: 0, backgroundColor: 'transparent' } : {},
            {
              width: UI.layout.width,
              paddingRight: actionWidth,
              transform: [{
                translateX: this.deltaX.interpolate({
                  inputRange: [-dragDistance, 0],
                  outputRange: [-dragDistance, 0],
                  extrapolateLeft: 'clamp',
                }),
              }],
            },
          ]}
        >
          <Image source={require('assets/icons/25/reply.png')} style={{ tintColor: '#FFF' }} />
        </Animated.View>

        <Interactable.View
          horizontalOnly={true}
          snapPoints={[{ tension, x: 0, damping: 1 - damping }]}
          alertAreas={[
            { id: 'left', influenceArea: { left: dragDistance } },
            { id: 'right', influenceArea: { left: -dragDistance } },
          ]}
          boundaries={{ left: -150, right: 150, bounce: 0.5 }}
          onAlert={this.onAlert}
          onDrag={this.onDrag}
          dragToss={0.01}
          animatedValueX={this.deltaX}
          animatedNativeDriver={true}
          dragEnabled={UI.settings.general.commentSwipeActions}
        >
          <Comment
            depth={depth}
            collapsed={collapsed}
            metalinks={UI.settings.appearance.commentsShowMetaLinks}
            hidden={hidden}
            item={item}
            onPress={this.onPress}
          />
        </Interactable.View>
        <View style={styles.border} />
        <View style={styles[`divider${depth}`]} />
      </View>
    );
  }
}
