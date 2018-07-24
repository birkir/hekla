import * as React from 'react';
import { ScrollView, View, Text, Platform } from 'react-native';
import { autobind } from 'core-decorators';
import { Navigation } from 'react-native-navigation';
import UI from 'stores/UI';
import Cell from 'components/cell/Cell';
import CellIcon from 'components/cell/CellIcon';
import CellGroup from 'components/cell/CellGroup';
import Search from 'stores/Search';
import SearchInput from 'components/search-input/SearchInput';
import { observer } from 'mobx-react';
import { theme, applyThemeOptions } from 'styles';
import { storyScreen, userScreen, RESULT_SCREEN } from 'screens';
import { observable } from 'mobx';
const styles = theme(require('./Search.styl'));

interface Props {
  componentId: string;
}

@observer
export default class SearchScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'Search',
        },
        searchBar: true,
        searchBarHiddenWhenScrolling: false,
        searchBarPlaceholder: 'Search Hacker News...',
      },
      bottomTab: {
        text: 'Search',
        testID: 'SEARCH_TAB',
        icon: require('assets/icons/25/search.png'),
      },
    });
  }

  @observable
  query = '';

  @observable
  isFocused = false;

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

  fetchData() {
    Search.fetchTrending();
  }

  @autobind
  searchBarUpdated({ text, isFocused }) {
    this.query = text;
    this.isFocused = isFocused;
  }

  @autobind
  searchBarCancelPressed() {
    this.isFocused = false;
  }

  @autobind
  onSearchChange(text: string) {
    this.query = text;
  }

  @autobind
  onSearchFocus() {
    this.isFocused = true;
  }

  @autobind
  onSearchBlur() {
    this.isFocused = false;
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, SearchScreen.options);
  }

  @autobind
  onSearchStoriesPress() {
    Navigation.push(this.props.componentId, {
      component: {
        name: RESULT_SCREEN,
        passProps: {
          type: 'stories',
          query: this.query,
        },
      },
    });
  }

  @autobind
  onSearchCommentsPress() {
    Navigation.push(this.props.componentId, {
      component: {
        name: RESULT_SCREEN,
        passProps: {
          type: 'comments',
          query: this.query,
        },
      },
    });
  }

  @autobind
  onSearchAllPress() {
    Navigation.push(this.props.componentId, {
      component: {
        name: RESULT_SCREEN,
        passProps: {
          query: this.query,
        },
      },
    });
  }

  @autobind
  onTrendingPress(e, { item }) {
    return storyScreen({ id: item.id });
  }

  @autobind
  onUserPress() {
    // TODO: Check if user exists
    return userScreen(this.query.toLowerCase());
  }

  @autobind
  renderTrending(item, index) {
    return (
      <Cell
        key={item.id}
        item={item}
        left={<Text style={styles.number}>{index + 1}.</Text>}
        title={item.title}
        numberOfLines={2}
        onPress={this.onTrendingPress}
      />
    );
  }

  render() {
    const query = this.query;

    return (
      <ScrollView
        style={styles.host}
        testID="SEARCH_SCREEN"
        keyboardShouldPersistTaps="always"
      >
        {Platform.OS === 'android' && (
          <SearchInput
            onChangeText={this.onSearchChange}
            onFocus={this.onSearchFocus}
            onBlur={this.onSearchBlur}
          />
        )}
        {this.isFocused && query !== '' ? (
          <View>
            <CellGroup header={false} footer={true}>
              <Cell
                left={<CellIcon source={require('assets/icons/25/search.png')} tintColor="#444" size={16} />}
                title={`Stories with "${query}"`}
                onPress={this.onSearchStoriesPress}
                more={true}
              />
              <Cell
                left={<CellIcon source={require('assets/icons/25/search.png')} tintColor="#444" size={16} />}
                title={`Comments with "${query}"`}
                onPress={this.onSearchCommentsPress}
                more={true}
              />
              <Cell
                left={<CellIcon source={require('assets/icons/25/search.png')} tintColor="#444" size={16} />}
                title={`All items with "${query}"`}
                onPress={this.onSearchAllPress}
                more={true}
              />
              <Cell
                left={<CellIcon source={require('assets/icons/25/user.png')} tintColor="#444" size={16} />}
                title={`Go to user "${query}"`}
                onPress={this.onUserPress}
                more={true}
              />
            </CellGroup>
          </View>
        ) : (
          <View style={styles.trending}>
            <CellGroup header="Trending today" footer={true}>
              {Search.trending.map(this.renderTrending)}
            </CellGroup>
          </View>
        )}
      </ScrollView>
    );
  }
}
