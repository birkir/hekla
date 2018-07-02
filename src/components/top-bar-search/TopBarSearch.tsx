import * as React from 'react';
import SearchBar from 'react-native-search-bar'; // tslint:disable-line
import { View, Dimensions } from 'react-native';
import Search from 'stores/Search';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

interface Props {
  testID?: string;
}

const gutter = 16;

export default class TopBarSearch extends React.Component<Props> {

  private searchRef = React.createRef() as any;

  state = {
    width: Dimensions.get('window').width - gutter,
    top: 0,
  };

  onChangeText(text) {
    Search.setQuery(text);
  }

  @autobind
  onSearchButtonPress() {
    this.searchRef.current.blur();
    Search.search();
  }

  onCancelButtonPress() {
    Search.setQuery('');
    Search.clear();
  }

  @autobind
  onLayout(e) {
    // Get width of window
    const { width, height } = Dimensions.get('window');

    this.setState({
      width: width - gutter,
      top: width > height ? -10 : -15,
    });
  }

  render() {
    const { width, top } = this.state;

    return (
      <View style={{ width, flex: 1, top: -8, marginLeft: gutter / 2 }} onLayout={this.onLayout}>
        <View>
          <SearchBar
            ref={this.searchRef}
            placeholder="Search"
            searchBarStyle="minimal"
            onChangeText={this.onChangeText}
            onSearchButtonPress={this.onSearchButtonPress}
            onCancelButtonPress={this.onCancelButtonPress}
          />
        </View>
      </View>
    );
  }
}
