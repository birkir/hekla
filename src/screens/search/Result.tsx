import * as React from 'react';
import { View, FlatList } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { autobind } from 'core-decorators';
import StoryCard from 'components/story-card/StoryCard';
import Search from 'stores/Search';
import Item from 'stores/models/Item';
import Loading from 'components/loading/Loading';
import Comment from 'components/comment/Comment';
import { Navigation } from 'react-native-navigation';
import UI from 'stores/UI';
import set from 'lodash/set';
import { observer } from 'mobx-react';
import { theme, applyThemeOptions } from 'styles';
import { observable } from 'mobx';
import openActionSheet from 'utils/openActionSheet';
const styles = theme(require('./Result.styl'));

interface Props {
  componentId: string;
  query: string;
  type?: string;
}

type IItemType = typeof Item.Type;

@observer
export default class ResultScreen extends React.Component<Props> {

  private listRef = React.createRef() as any;

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Results',
        },
        rightButtons: [
          {
            id: 'sort',
            text: Search.sort === 'search' ? 'Popular' : 'Newest',
          },
        ],
        largeTitle: {
          visible: false,
        },
      },
    });
  }

  @observable
  isRefreshing = false;

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentWillMount() {
    UI.addScreen(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    UI.removeScreen(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'sort') {
      const options = [{
        id: 'popular',
        title: 'Popular',
      }, {
        id: 'newest',
        title: 'Newest',
      }];
      openActionSheet({ options, title: 'Sort by', cancel: 'Cancel' }, (selected) => {
        if (selected.id === 'popular') {
          Search.setSort('search');
        }
        if (selected.id === 'newest') {
          Search.setSort('search_by_date');
        }
        this.updateOptions();
        Search.clear();
        Search.search();
      });
    }
  }

  async fetchData() {
    const { query, type } = this.props;

    Search.clear();
    Search.setQuery(query);

    if (type === 'stories') {
      Search.setTags(['story']);
    } else if (type === 'comments') {
      Search.setTags(['comment']);
    } else {
      Search.setTags([]);
    }

    Search.search();
  }

  @autobind
  updateOptions() {
    const opts = ResultScreen.options;
    set(opts, 'topBar.title.text', `Results for "${this.props.query}"`);
    Navigation.mergeOptions(this.props.componentId, ResultScreen.options);
  }

  @autobind
  keyExtractor(item: IItemType, index: number) {
    return `Item_${item.id}`;
  }

  async onRefresh() {
    ReactNativeHapticFeedback.trigger('impactLight', true);
    this.isRefreshing = true;
    Search.clear();
    await Search.search();
    this.isRefreshing = false;
  }

  onEndReached() {
    if (!Search.isLoading) {
      Search.nextPage();
    }
  }

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
      return (
        <Comment
          key={item.id}
          item={item}
          metalinks={false}
          card={true}
        />
      );
    }

    return null;
  }

  render() {
    return (
      <View
        style={styles.host}
        testID="RESULT_SCREEN"
      >
        <FlatList
          ref={this.listRef}
          style={styles.list}
          data={Search.items}
          ListFooterComponent={!this.isRefreshing && Search.isLoading && <Loading />}
          extraData={Search.items.length}
          keyExtractor={this.keyExtractor}
          renderItem={this.renderStory}
          refreshing={this.isRefreshing}
          onRefresh={this.onRefresh}
          onEndReachedThreshold={0.75}
          onEndReached={this.onEndReached}
        />
      </View>
    );
  }
}
