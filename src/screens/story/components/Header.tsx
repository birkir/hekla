import * as React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import FormatText from 'components/format-text/FormatText';
import MetaLink from 'components/meta-link/MetaLink';
import StoryRow from 'components/story-row/StoryRow';
import Item from 'stores/models/Item';
import UI from 'stores/UI';
import openActionSheet from 'utils/openActionSheet';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import { replyScreen } from 'screens';
import { theme } from 'styles';
import Account from 'stores/Account';
import promptLogin from 'utils/promptLogin';
const styles = theme(require('./Header.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
}

@observer
export default class StoryHeader extends React.Component<Props> {

  @autobind
  onVotePress() {
    this.props.item.vote();
  }

  @autobind
  onFlagPress() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }

    if (this.props.item.isFlagged) {
      return this.props.item.flag();
    }

    Alert.alert(
      'Confirm report',
      'Do you want to report this story?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => this.props.item.flag(),
        },
      ],
    );
  }

  @autobind
  onHidePress() {
    this.props.item.hide();
  }

  @autobind
  onReplyPress() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }
    return replyScreen(this.props.item.id);
  }

  @autobind
  onSharePress() {
    if (!this.props.item.url) {
      return this.share(this.props.item.hackernewsUrl);
    }

    const options = [{
      id: 'hackernews',
      icon: require('assets/icons/32/hacker-news.png'),
      title: 'Hackernews Link',
      titleTextAlignment: 0,
    }, {
      id: 'content',
      icon: require('assets/icons/32/safari-line.png'),
      title: 'Content Link',
      titleTextAlignment: 0,
    }];

    return openActionSheet({ options, type: 'list', cancel: 'Cancel' }, this.onShareAction);
  }

  @autobind
  onShareAction({ id }) {
    if (id === 'hackernews') {
      this.share(this.props.item.hackernewsUrl);
    }
    if (id === 'content') {
      this.share(this.props.item.url);
    }
  }

  share(url: string) {
    Share.share({
      url,
      title: this.props.item.title,
    });
  }

  render() {
    const { item } = this.props;

    if (!item) {
      return null;
    }

    const { title, text, prettyText, metadata = {}, url } = item;
    const paddingHorizontal = Math.max(0, UI.layout.inset - 16);

    return (
      <View style={[styles.host, { borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: -StyleSheet.hairlineWidth }]}>
        <View style={{ paddingHorizontal }}>
          {!!title && <Text style={[styles.title, UI.font(17)]}>{title}</Text>}
          <MetaLink
            {...metadata}
            url={url}
            large={true}
          />
          {!!text && (
            <FormatText style={[styles.summary, UI.font(15)]}>
              {prettyText}
            </FormatText>
          )}
          <StoryRow actions={false} item={item} />
        </View>
        <View style={[styles.actions, { paddingHorizontal, borderTopWidth: StyleSheet.hairlineWidth }]}>
          <TouchableOpacity style={styles.actions__item} onPress={this.onVotePress}>
            <Image
              source={require('assets/icons/32/arrow-up.png')}
              style={[styles.icon, item.isVoted && styles.icon__active]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onFlagPress}>
            <Image
              source={require('assets/icons/32/flag.png')}
              style={[styles.icon, item.isFlagged && styles.icon__active, { width: 24, height: 24 }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onHidePress}>
            <Image
              source={require('assets/icons/32/hide.png')}
              style={[styles.icon, item.isHidden && styles.icon__active]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onReplyPress}>
            <Image
              source={require('assets/icons/32/reply.png')}
              style={styles.icon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actions__item} onPress={this.onSharePress}>
            <Image
              source={require('assets/icons/32/share.png')}
              style={[styles.icon, { top: -2, width: 28, height: 28 }]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
