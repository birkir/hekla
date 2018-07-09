import * as React from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, findNodeHandle, Platform } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import FormatText from 'components/format-text/FormatText';
import Element from 'components/element/Element';
import MetaLink from 'components/meta-link/MetaLink';
import { observer } from 'mobx-react';
import { theme, getVar } from 'styles';
import { storyScreen } from 'screens';
const styles = theme(require('./StoryCard.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key: string;
  item: IItemType;
  testID?: string;
}

interface State {
  underlay: boolean;
  loaded: boolean;
  loading: boolean;
}

@observer
export default class StoryCard extends React.Component<Props> {

  hostRef = React.createRef() as any;
  // elementId = `element_${this.props.item.id}`;
  pressInTimer;

  @autobind
  onPress() {
    clearTimeout(this.pressInTimer);
    return storyScreen(this.props.item);
  }

  @autobind
  async onPressIn() {
    if (Platform.OS !== 'ios') return;

    const reactTag = findNodeHandle(this.hostRef.current);
    storyScreen(this.props.item, reactTag);

    return;
  }

  @autobind
  onVotePress() {
    this.props.item.vote();
  }

  render() {
    const { item, testID } = this.props;
    const { title, text, prettyText, url, metadata = {}, ago, by, descendants, score } = item;

    return (
      <TouchableHighlight
        ref={this.hostRef}
        accessibilityComponentType="button"
        testID={testID}
        onPress={this.onPress}
        onPressIn={this.onPressIn}
        style={styles.host}
        activeOpacity={1}
        underlayColor={getVar('--content-bg-active-color', 'gray')}
      >
        <View>
          {!!title && <Text style={styles.title}>{title}</Text>}
          <MetaLink
            {...metadata}
            url={url}
            large={true}
          />
          {!!text && (
            <View style={{ marginBottom: 8 }}>
              <FormatText
                noLinks={true}
                noFormat={true}
                numberOfLines={10}
                style={styles.summary}
              >
                {prettyText}
              </FormatText>
            </View>
          )}
          <View style={styles.row}>
            <View style={styles.row__left}>
              <Text style={styles.row__author}>{by}</Text>
              <View style={styles.row}>
                <Image style={styles.row__icon} source={require('assets/icons/16/arrow-up.png')} />
                <Text style={styles.row__text}>{score}</Text>
                <Image style={styles.row__icon} source={require('assets/icons/16/comments.png')} />
                <Text style={styles.row__text}>{descendants}</Text>
                <Image style={styles.row__icon} source={require('assets/icons/16/clock.png')} />
                <Text style={styles.row__text}>{ago}</Text>
              </View>
            </View>
            <View style={styles.row__actions}>
              <TouchableOpacity onPress={this.onVotePress} style={styles.row__action}>
                <Image style={[styles.row__action__icon, item.isUserVote && styles.row__action__active]} source={require('assets/icons/32/arrow-up.png')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
