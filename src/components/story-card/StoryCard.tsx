import * as React from 'react';
import { View, Text } from 'react-native';
import TouchablePreview from 'components/touchable-preview/TouchablePreview';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import UI from 'stores/UI';
import FormatText from 'components/format-text/FormatText';
import StoryRow from 'components/story-row/StoryRow';
import MetaLink from 'components/meta-link/MetaLink';
import { observer } from 'mobx-react';
import { theme } from 'styles';
import { STORY_SCREEN, storyScreen } from 'screens';
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

  @autobind
  onPress(reactTag?: number) {
    const { item, isMasterView } = this.props;
    const { id, descendants } = item;

    return storyScreen({
      id,
      descendants,
      isMasterView,
      reactTag,
    });
  }

  render() {
    const { item } = this.props;
    const { title, text, prettyText, url, metadata = {} } = item;
    const paddingHorizontal = Math.max(0, UI.layout.inset - 16) + 16;
    const isCompact = UI.settings.appearance.storySize === 'compact';

    if (!item.by && (!item.title || item.title === '' || item.time === 0)) {
      return null;
    }

    return (
      <TouchablePreview
        componentName={STORY_SCREEN}
        onPress={this.onPress}
        onPressIn={this.onPress}
        style={[styles.host, isCompact && styles.host__compact]}
      >
        <View
          style={[
            styles.container,
            isCompact && [
              styles.container__compact,
              UI.settings.appearance.compactThumbnail === 'right' && styles.container__reverse,
            ],
            { paddingHorizontal },
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
            <View style={[styles.divider, { left: paddingHorizontal }]} />
          )}
        </View>
      </TouchablePreview>
    );
  }
}
