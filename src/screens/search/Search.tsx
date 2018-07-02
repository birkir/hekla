import * as React from 'react';
import { View, Text, FlatList } from 'react-native';
import { autobind } from 'core-decorators';
import StoryCard from 'components/story-card/StoryCard';
import Search from 'stores/Search';
import Item from 'stores/models/Item';
import Loading from 'components/loading/Loading';
import { Navigation } from 'react-native-navigation';
import UI from 'stores/UI';
import { observer } from 'mobx-react';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Search.styl'));

interface Props {
  componentId: string;
}

type IItemType = typeof Item.Type;

@observer
export default class SearchScreen extends React.Component<Props> {

  private navigationHandler;
  private listRef = React.createRef() as any;

  static TAB_INDEX = 2;

  static get options() {
    return applyThemeOptions({
      topBar: {
        component: {
          name: 'hekla.TopBarSearch',
        },
      },
    });
  }

  state = {
    query: null,
    page: 0,
    isKeyboardOpen: false,
    isSearchFocused: false,
  };

  componentDidAppear() {
    UI.setComponentId(this.props.componentId);
    this.updateOptions();
  }

  componentWillMount() {
    this.navigationHandler = Navigation.events().registerNativeEventListener((name, params) => {
      if (name === 'bottomTabSelected') {
        const { selectedTabIndex, unselectedTabIndex } = params;
        if (selectedTabIndex === SearchScreen.TAB_INDEX && unselectedTabIndex === SearchScreen.TAB_INDEX) {
          this.scrollToTop();
        }
      }
    });
  }

  componentWillUnmount() {
    this.navigationHandler.remove();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SearchScreen.options);
  }

  scrollToTop() {
    this.listRef.current.scrollToOffset({ offset: -100, animated: true });
  }

  @autobind
  onEndReached(e) {
    if (!Search.isLoading) {
      Search.nextPage();
    }
  }

  @autobind
  keyExtractor(item: IItemType, index: number) {
    return `Item_${item.id}`;
  }

  @autobind
  renderStory({ item }: { item: IItemType }) {
    if (item.type === 'story') {
      return (
        <StoryCard
          key={item.id}
          item={item}
        />
      );
    }

    if (item.type === 'comment') {
      return null;
      return (
        <View>
          <Text>Comment by {item.by}</Text>
        </View>
      );
    }

    return null;
  }

  render() {
    return (
      <View
        style={styles.host}
        testID="SEARCH_SCREEN"
      >
        <FlatList
          ref={this.listRef}
          style={styles.list}
          data={Search.items}
          ListFooterComponent={Search.isLoading && <Loading />}
          extraData={Search.items.length}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderStory}
          onEndReachedThreshold={0.75}
          onEndReached={this.onEndReached}
          contentInset={{ top: 15 }}
        />
      </View>
    );
  }
}
