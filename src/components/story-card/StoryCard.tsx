import * as React from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, findNodeHandle, Platform } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import UI from 'stores/UI';
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
  isMasterView?: boolean;
  item: IItemType;
  testID?: string;
}

@observer
export default class StoryCard extends React.Component<Props> {

  hostRef = React.createRef() as any;

  @autobind
  onPress() {
    const { item, isMasterView } = this.props;
    const { id, descendants } = item;
    return storyScreen({
      id,
      descendants,
      isMasterView,
    });
  }

  @autobind
  onPressIn() {
    if (Platform.OS !== 'ios') return;
    const { item, isMasterView } = this.props;
    const { id, descendants } = item;
    return storyScreen({
      id,
      descendants,
      isMasterView,
      reactTag: findNodeHandle(this.hostRef.current),
    });

    return;
  }

  render() {
    const { item, testID } = this.props;
    const { title, text, prettyText, url, metadata = {} } = item;
    const paddingLeft = Math.max(0, UI.insetLeft - 16) + 16;
    const paddingRight = Math.max(0, UI.insetRight - 16) + 16;
    const isCompact = UI.settings.appearance.storySize === 'compact';

    return (
      <TouchableHighlight
        ref={this.hostRef}
        accessibilityComponentType="button"
        testID={testID}
        onPress={this.onPress}
        onPressIn={this.onPressIn}
        style={[styles.host, isCompact && styles.host__compact]}
        activeOpacity={1}
        underlayColor={getVar('--content-bg-highlight', 'gray')}
      >
        <View
          style={[
            styles.container,
            isCompact && [
              styles.container__compact,
              UI.settings.appearance.compactThumbnail === 'right' && styles.container__reverse,
            ],
            { paddingLeft, paddingRight },
          ]}
        >
          {isCompact && UI.settings.appearance.compactThumbnail !== 'noThumbnails' && (
            <MetaLink
              {...metadata}
              url={url}
              compact={true}
            />
          )}
          <View style={isCompact && styles.content}>
            {!!title && (
              <Text
                style={[
                  styles.title,
                  isCompact && styles.title__compact,
                  UI.font(isCompact ? 15 : 17),
                  item.isRead && styles.read,
                ]}
              >
                {title}
              </Text>
            )}
            {!isCompact && (
              <MetaLink
                {...metadata}
                url={url}
                large={true}
              />
            )}
            {!!text && !isCompact && (
              <View style={[styles.text, item.isRead && styles.read]}>
                <FormatText
                  noLinks={true}
                  noFormat={true}
                  numberOfLines={10}
                  style={[styles.summary, UI.font(15)]}
                >
                  {prettyText}
                </FormatText>
              </View>
            )}
            <View style={item.isRead && styles.read}>
              <StoryRow item={item} compact={isCompact} />
            </View>
          </View>
          {isCompact && (
            <View style={[styles.divider, { left: paddingLeft }]} />
          )}
        </View>
      </TouchableHighlight>
    );
  }
}
