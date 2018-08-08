import * as React from 'react';
import { View, FlatList, Text } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import { observable, autorun } from 'mobx';
import { Navigation } from 'react-native-navigation';
import storyTypeActionSheet from 'utils/actionsheets/storyType';
import StoryCard from 'components/story-card/StoryCard';
import Loading from 'components/loading/Loading';
import Toast from 'components/toast/Toast';
import Stories from 'stores/Stories';
import Item from 'stores/models/Item';
import UI from 'stores/UI';
import { theme, applyThemeOptions, getVar } from 'styles';
const styles = theme(require('./Stories.styl'));

interface Props {
  children: React.ReactNode;
  componentId?: string;
}

type IItemType = typeof Item.Type;

@observer
export default class StoriesScreen extends React.Component<Props> {

  private listRef = React.createRef() as any;
  private bottomTabSelectedListener;

  @observable
  isRefreshing = false;

  @observable
  offset = 0;

  @observable
  limit = 25;

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: String(Stories.prettyType),
        },
        hideOnScroll: UI.settings.general.hideBarsOnScroll,
        rightButtons: [{
          id: 'change',
          text: 'Change',
          icon: require('assets/icons/25/slider.png'),
        }],
      },
      layout: {
        backgroundColor: getVar('--backdrop'),
      },
      bottomTab: {
        text: 'Stories',
        testID: 'STORIES_TAB',
        icon: require('assets/icons/25/stories.png'),
      },
    });
  }

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, StoriesScreen.options);
  }

  componentWillMount() {
    UI.addScreen(this);

    // Fetch data needed to display screen
    this.fetchData();

    // Update screen options on Stories.type change
    autorun(() => {
      if (Stories.type) {
        this.updateOptions();
      }
    });

    this.bottomTabSelectedListener = Navigation.events().registerBottomTabSelectedListener(({ selectedTabIndex, unselectedTabIndex }) => {
      if (selectedTabIndex === unselectedTabIndex && UI.componentId === this.props.componentId) {
        this.scrollToTop();
      }
    });
  }

  componentWillUnmount() {
    Stories.dispose();
    this.bottomTabSelectedListener.remove();
    UI.removeScreen(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'change') {
      storyTypeActionSheet(this.onStoryTypeChange);
    }
  }

  @autobind
  async onRefresh() {
    ReactNativeHapticFeedback.trigger('impactLight', true);
    this.offset = 0;
    this.isRefreshing = true;
    await this.fetchData();
    this.isRefreshing = false;
  }

  @autobind
  onEndReached(e) {
    if (!Stories.isLoading) {
      this.offset += this.limit;
      this.fetchData();
    }
  }

  @autobind
  onStoryTypeChange({ id }) {
    if (Stories.setType(id)) {
      this.updateOptions();
      this.offset = 0;
      this.fetchData();
    }
  }

  async fetchData() {
    if (this.offset === 0) {
      if (!this.isRefreshing) {
        // Scroll to top
        await this.scrollToTop();
      }

      // Clear stories
      Stories.clear();
    }

    // Fetch items needed to display this screen
    await Stories.fetchStories(this.offset, this.limit);
  }

  @autobind
  async scrollToTop() {
    const { topBarHeight, statusBarHeight } = UI.layout;
    if (this.listRef.current) {
      this.listRef.current.scrollToOffset({ offset: -(topBarHeight + statusBarHeight) });
      await new Promise(r => setTimeout(r, 330));
    }
  }

  @autobind
  keyExtractor(item: IItemType, index: number) {
    if (!item) return `Story_${index}_Empty`;
    return `Story_${item.id}`;
  }

  @autobind
  renderStory({ item }: { item: IItemType }) {
    if (!item || item.isHidden) {
      return null;
    }

    if (item.type === 'page' && UI.settings.appearance.showPageEndings) {
      return (
        <Text style={styles.page}>PAGE {item.time + 1}</Text>
      );
    }

    return (
      <StoryCard
        isMasterView={true}
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
        <Toast
          bottom={UI.layout.bottomTabsHeight}
          visible={!UI.isConnected}
          message="You are offline"
          icon={require('assets/icons/16/offline.png')}
        />
      </View>
    );
  }
}
