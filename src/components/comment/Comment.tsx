import * as React from 'react';
import { View, Text, Image, TouchableHighlight, Animated, LayoutAnimation, TouchableWithoutFeedback, ActionSheetIOS, StyleSheet, Share, TouchableOpacity } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import { replyScreen, userScreen } from 'screens';
import Interactable from 'react-native-interactable';
import FormatText from 'components/format-text/FormatText';
import UI from 'stores/UI';
import Account from 'stores/Account';
import { theme, getVar } from 'styles';
const styles = theme(require('./Comment.styl'));

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

export default class Comment extends React.PureComponent<Props, State> {

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
  onMorePress() {
    const { isUserVote, isUserFavorite, isUserHidden } = this.props.item;
    const options = [{
      icon:  resolveAssetSource(require('assets/icons/32/arrow-up.png')),
      title: isUserVote ? 'Unvote' : 'Vote',
      titleTextAlignment: 0,
    }, {
      icon:  resolveAssetSource(require('assets/icons/32/star.png')),
      title: isUserFavorite ? 'Unfavorite' : 'Favorite',
      titleTextAlignment: 0,
    }, {
      icon:  resolveAssetSource(require('assets/icons/32/hide.png')),
      title: isUserHidden ? 'Unhide' : 'Hide',
      titleTextAlignment: 0,
    }, {
      icon:  resolveAssetSource(require('assets/icons/32/reply.png')),
      title: 'Reply',
      titleTextAlignment: 0,
    }, {
      icon:  resolveAssetSource(require('assets/icons/32/user.png')),
      title: this.props.item.by,
      titleTextAlignment: 0,
    }, {
      icon:  resolveAssetSource(require('assets/icons/32/share.png')),
      title: 'Share',
      titleTextAlignment: 0,
    }];

    if (this.props.item.by === Account.user.id) {
      options.push({
        title: 'Edit',
        titleTextAlignment: 0,
      } as any);
      options.push({
        title: 'Delete',
        titleTextAlignment: 0,
      } as any);
    }

    ActionSheetIOS.showActionSheetWithOptions(
      {
        cancelButtonIndex: options.length,
        options: [
          ...options,
          {
            title: 'Cancel',
          },
        ] as any,
      },
      (index) => {
        if (index === 0) {
          this.props.item.vote();
        }
        if (index === 1) {
          this.props.item.favorite();
        }
        if (index === 2) {
          this.props.item.hide();
        }
        if (index === 3) {
          replyScreen(this.props.item.id);
        }
        if (index === 4) {
          userScreen(this.props.item.by);
        }
        if (index === 5) {
          Share.share({
            message: this.props.item.prettyText,
          });
        }
        if (this.props.item.by === Account.user.id) {
          if (index === 6) {
            replyScreen(this.props.item.id, true);
          }
          if (index === 7) {
            this.onDelete();
          }
        }
      },
    );
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

  @autobind
  onUserPress() {
    userScreen(this.props.item.by);
  }

  @autobind
  async onDelete() {
    this.props.item.delete();
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  render() {
    const { isActionLeftActive, isActionRightActive } = this.state;
    const { hidden, collapsed, depth, item } = this.props;
    const { ago, by, isUserVote } = item;

    if (!by || hidden) {
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
            {
              width: UI.width,
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
            hidden ? { opacity: 0 } : {},
            {
              width: UI.width,
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
        >
          <TouchableHighlight
            onPress={this.onPress}
            onLongPress={this.onMorePress}
            activeOpacity={1}
            underlayColor={getVar('--content-bg-active-color')}
            style={styles.content}
          >
            <View style={[styles.container, styles[`level${depth}`]]}>
              <View style={[styles.row, !collapsed && styles.row__expanded]}>
                <TouchableOpacity onPress={this.onUserPress}>
                  <Text style={styles.author}>{by}</Text>
                </TouchableOpacity>
                {isUserVote && <Image style={styles.icon__arrow} source={require('assets/icons/16/arrow-up.png')} />}
                <View style={styles.flex} />
                {!collapsed && (
                  <TouchableWithoutFeedback onPress={this.onMorePress}>
                    <Image source={require('assets/icons/16/more.png')} style={styles.icon__more} />
                  </TouchableWithoutFeedback>
                )}
                {!collapsed && <Text style={styles.ago}>{ago}</Text>}
                {collapsed && <Image source={require('assets/icons/16/chevron-down.png')} style={styles.icon__expand} />}
              </View>
              {!collapsed && (
                <FormatText style={styles.text}>{item.prettyText}</FormatText>
              )}
            </View>
          </TouchableHighlight>
        </Interactable.View>
        <View style={styles.border} />
        <View style={[styles[`divider${depth}`], { height: StyleSheet.hairlineWidth }]} />
      </View>
    );
  }
}
