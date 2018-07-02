import * as React from 'react';
import { View, FlatList, ActionSheetIOS, Platform, NativeModules } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import StoryCard from 'components/story-card/StoryCard';
import Loading from 'components/loading/Loading';
import Stories from 'stores/Stories';
import Item from 'stores/models/Item';
import { observable, autorun } from 'mobx';
import UI from 'stores/UI';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Stories.styl'));

interface Props {
  children: React.ReactNode;
  componentId?: string;
}

const typeIcons = {
  topstories: require('assets/icons/32/trophy.png'),
  newstories: require('assets/icons/32/new.png'),
  askstories: require('assets/icons/32/decision.png'),
  showstories: require('assets/icons/32/training.png'),
  jobstories: require('assets/icons/32/jobs.png'),
};

type IItemType = typeof Item.Type;

@observer
export default class StoriesScreen extends React.Component<Props> {

  private listRef = React.createRef() as any;

  @observable
  isRefreshing = false;

  @observable
  offset = 0;

  @observable
  limit = 10;

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: String(Stories.prettyType),
        },
        rightButtons: [{
          id: 'change',
          title: 'Change',
          icon: require('assets/icons/25/slider.png'),
        }],
      },
    });
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, StoriesScreen.options);
  }

  componentDidAppear() {
    this.updateOptions();
  }

  componentWillMount() {
    Stories.fetchStories(this.offset, this.limit);
    autorun(() => {
      if (Stories.type) {
        this.updateOptions();
      }
    });
  }

  onNavigationButtonPressed(buttonId) {
    if (buttonId === 'change') {
      this.onTypePress();
    }
  }

  @autobind
  async onRefresh() {
    this.offset = 0;
    Stories.clear();
    this.isRefreshing = true;
    await Stories.fetchStories(this.offset, this.limit);
    this.isRefreshing = false;
  }

  @autobind
  onEndReached(e) {
    if (!Stories.isLoading) {
      this.offset += this.limit;
      Stories.fetchStories(this.offset, this.limit);
    }
  }

  @autobind
  onTypePress() {
    const types = [
      'topstories',
      'newstories',
      'askstories',
      'showstories',
      'jobstories',
    ];

    const options = types.map(type => ({
      title: Stories.pretty(type),
      titleTextAlignment: 0,
      icon: typeIcons[type] && resolveAssetSource(typeIcons[type]),
    }));

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
      (index: number) => {
        if (index < types.length) {
          if (Stories.setType(types[index])) {
            Stories.clear();
            Stories.fetchStories(this.offset, this.limit);
            this.scrollToTop();
          }
        }
      },
    );
  }

  @autobind
  async scrollToTop() {
    const { topBarHeight, statusBarHeight } = await NativeModules.RNUeno.getHeights(UI.componentId);
    this.listRef.current.scrollToOffset({ offset: -(topBarHeight + statusBarHeight) });
  }

  @autobind
  keyExtractor(item: IItemType, index: number) {
    if (!item) return `Story_${index}_Empty`;
    return `Story_${item.id}`;
  }

  @autobind
  renderStory({ item }: { item: IItemType }) {
    if (!item) return null;
    return (
      <StoryCard
        key={item.id}
        item={item}
      />
    );
  }

  render() {
    return (
      <View
        style={styles.host}
        testID="STORIES_SCREEN"
      >
        <FlatList
          ref={this.listRef}
          style={styles.list}
          data={Stories.stories}
          extraData={Stories.stories.length}
          ListFooterComponent={!this.isRefreshing && Stories.isLoading && <Loading end={true} />}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderStory}
          refreshing={this.isRefreshing}
          onEndReachedThreshold={0.75}
          onRefresh={this.onRefresh}
          onEndReached={this.onEndReached}
          scrollEnabled={UI.scrollEnabled}
        />
      </View>
    );
  }
}
