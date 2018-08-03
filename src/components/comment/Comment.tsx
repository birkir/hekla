import * as React from 'react';
import { View, Text, Image, TouchableHighlight, TouchableWithoutFeedback, Share, TouchableOpacity, Platform, Clipboard } from 'react-native';
import openActionSheet from 'utils/openActionSheet';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import { replyScreen, userScreen, storyScreen } from 'screens';
import FormatText from 'components/format-text/FormatText';
import Account from 'stores/Account';
import UI from 'stores/UI';
import { theme, getVar } from 'styles';
import { observer } from 'mobx-react';
import promptLogin from 'utils/promptLogin';
const styles = theme(require('./Comment.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
  parent?: IItemType;
  depth?: number;
  collapsed?: boolean;
  hidden?: boolean;
  metalinks?: boolean;
  numberOfLines?: number;
  onPress?: (Props) => void;
  card?: boolean;
  divider?: boolean;
  testID?: string;
}

@observer
export default class Comment extends React.Component<Props> {

  @autobind
  onMorePress() {
    const { item } = this.props;

    const options = [{
      id: 'vote',
      icon: require('assets/icons/32/arrow-up.png'),
      title: item.isVoted ? 'Unvote' : 'Vote',
      titleTextAlignment: 0,
    }, {
    //   id: 'favorite',
    //   icon: require('assets/icons/32/star.png'),
    //   title: item.isFavorited ? 'Unfavorite' : 'Favorite',
    //   titleTextAlignment: 0,
    // }, {
      id: 'hide',
      icon: require('assets/icons/32/hide.png'),
      title: item.isHidden ? 'Unhide' : 'Hide',
      titleTextAlignment: 0,
    }, {
      id: 'reply',
      icon: require('assets/icons/32/reply.png'),
      title: 'Reply',
      titleTextAlignment: 0,
    }, {
      id: 'user',
      icon: require('assets/icons/32/user.png'),
      title: Platform.OS === 'android' ? `User "${item.by}"` : item.by,
      titleTextAlignment: 0,
    }, {
      id: 'copy',
      icon: require('assets/icons/32/copy.png'),
      title: 'Copy',
      titleTextAlignment: 0,
    }, {
      id: 'share',
      icon: require('assets/icons/32/share.png'),
      title: 'Share',
      titleTextAlignment: 0,
    }];

    if (this.props.item.isOwn) {
      options.push({
        id: 'edit',
        icon: require('assets/icons/32/edit.png'),
        title: 'Edit',
        titleTextAlignment: 0,
      } as any);
      options.push({
        id: 'delete',
        icon: require('assets/icons/32/delete.png'),
        title: 'Delete',
        titleTextAlignment: 0,
      } as any);
    }

    const title = Platform.OS === 'android' ? 'Comment' : undefined;

    openActionSheet({ options, title, type: 'list', cancel: 'Cancel' }, this.onActionSelect);
  }

  @autobind
  onActionSelect({ id }) {
    const { item } = this.props;
    if (id === 'vote') {
      item.vote();
    }
    if (id === 'favorite') {
      item.favorite();
    }
    if (id === 'hide') {
      item.hide();
    }
    if (id === 'reply') {
      if (Account.isLoggedIn) {
        replyScreen(item.id);
      } else {
        promptLogin();
      }
    }
    if (id === 'user') {
      userScreen(item.by);
    }
    if (id === 'share') {
      this.onShare();
    }
    if (id === 'copy') {
      Clipboard.setString(item.prettyText);
    }
    if (item.by === Account.user.id) {
      if (id === 'edit') {
        replyScreen(item.id, true);
      }
      if (id === 'delete') {
        this.onDelete();
      }
    }
  }

  @autobind
  async onPress() {
    const { onPress } = this.props;
    if (typeof onPress === 'function') {
      return onPress(this.props);
    }

    const getRoot = item => new Promise((resolve) => {
      if (item.parent && item.type !== 'story') {
        return item.fetchParent().then((parent) => {
          if (parent) {
            return getRoot(parent);
          }
        })
        .then(resolve);
      }
      resolve(item);
    });

    const root = await getRoot(this.props.item) as IItemType;
    const { id, descendants } = root;

    return storyScreen({
      id,
      descendants,
    });
  }

  @autobind
  onUserPress() {
    userScreen(this.props.item.by);
  }

  @autobind
  async onDelete() {
    await this.props.item.delete();
    this.forceUpdate();
  }

  @autobind
  onShare() {
    const options = [{
      id: 'hackernews',
      icon: require('assets/icons/32/hacker-news.png'),
      title: 'Link to Comment',
      titleTextAlignment: 0,
    }, {
      id: 'content',
      icon: require('assets/icons/32/comments.png'),
      title: 'Comment Text',
      titleTextAlignment: 0,
    }];

    return openActionSheet({ options, type: 'list', cancel: 'Cancel' }, this.onShareAction);
  }

  @autobind
  onShareAction({ id }) {
    const { item } = this.props;

    if (id === 'hackernews') {
      Share.share({
        url: item.hackernewsUrl,
        title: `Comment by ${item.by}`,
      });
    }

    if (id === 'content') {
      Share.share({
        message: item.prettyText,
      });
    }
  }

  renderParent() {
    if (this.props.collapsed || !this.props.parent) {
      return null;
    }

    const { text, prettyText, title, by } = this.props.parent;
    return (
      <View style={styles.parent}>
        {text ? (
          <FormatText
            noLinks={true}
            noFormat={true}
            numberOfLines={5}
            allowFontScaling={UI.settings.appearance.useSystemFontSize}
            style={styles.parent__text}
          >
            {prettyText}
          </FormatText>
        ) : (
          <Text style={styles.parent__title}>{title}</Text>
        )}
        <Text style={styles.parent__author}>{by}</Text>
      </View>
    );
  }

  render() {
    const {
      hidden = false,
      collapsed = false,
      card = false,
      metalinks = true,
      depth = 0,
      numberOfLines,
      item,
    } = this.props;

    const { ago, by } = item;

    if (!by || hidden) {
      return null;
    }

    const paddingHorizontal = Math.max(0, UI.layout.inset - 16) + 16;

    return (
      <TouchableHighlight
        onPress={UI.settings.general.commentTapToCollapse ? this.onPress : undefined}
        onLongPress={this.onMorePress}
        activeOpacity={1}
        underlayColor={getVar('--content-bg-highlight')}
        style={[styles.host, card && styles.host__card]}
      >
        <View style={[styles.container, styles[`level${depth}`], { paddingHorizontal }]}>
          <View style={[styles.row, !collapsed && styles.row__expanded]}>
            <TouchableOpacity onPress={this.onUserPress}>
              <Text style={[styles.author, item.isOwn && styles.author__me]}>{by}</Text>
            </TouchableOpacity>
            {item.isVoted && <Image style={styles.icon__arrow} source={require('assets/icons/16/arrow-up.png')} />}
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
            <FormatText
              style={[styles.text, UI.font(15)]}
              numberOfLines={numberOfLines}
              noLinks={!metalinks}
            >
              {item.prettyText}
            </FormatText>
          )}
          {this.renderParent()}
        </View>
      </TouchableHighlight>
    );
  }
}
