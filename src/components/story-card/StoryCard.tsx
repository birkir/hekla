import * as React from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, findNodeHandle, Platform } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import FormatText from 'components/format-text/FormatText';
import StoryRow from 'components/story-row/StoryRow';
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

@observer
export default class StoryCard extends React.Component<Props> {

  hostRef = React.createRef() as any;

  @autobind
  onPress() {
    return storyScreen(this.props.item);
  }

  @autobind
  async onPressIn() {
    if (Platform.OS !== 'ios') return;

    const reactTag = findNodeHandle(this.hostRef.current);
    storyScreen(this.props.item, reactTag);

    return;
  }

  render() {
    const { item, testID } = this.props;
    const { title, text, prettyText, url, metadata = {} } = item;

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
          {!!title && <Text style={[styles.title, item.isRead && styles.read]}>{title}</Text>}
          <MetaLink
            {...metadata}
            url={url}
            large={true}
          />
          {!!text && (
            <View style={[styles.text, item.isRead && styles.read]}>
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
          <View style={item.isRead && styles.read}>
            <StoryRow item={item} />
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}
