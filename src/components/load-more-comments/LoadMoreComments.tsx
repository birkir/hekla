import * as React from 'react';
import { View, Text, Image, TouchableHighlight, ActivityIndicator } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import UI from 'stores/UI';
import { theme, getVar } from 'styles';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
const styles = theme(require('./LoadMoreComments.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
  hidden: boolean;
  onPress?: (item: IItemType) => void;
  testID?: string;
}

@observer
export default class LoadMoreComments extends React.Component<Props> {

  @observable
  loading = false;

  @autobind
  onPress() {
    this.props.onPress(this.props);
    this.loading = true;
  }

  render() {
    const { hidden, item } = this.props;
    const total = item.unfetched;

    if (hidden) {
      return null;
    }

    const paddingHorizontal = Math.max(0, UI.layout.inset);

    return (
      <View style={styles.host}>
        <TouchableHighlight
          onPress={this.onPress}
          activeOpacity={1}
          underlayColor={getVar('--content-bg-highlight')}
          style={styles.content}
        >
          <View style={[styles.container, styles[`level${item.level}`], { paddingHorizontal }]}>
            <Text style={[styles.text, UI.font(14)]}>{total} more {total === 1 ? 'reply' : 'replies'}</Text>
            {this.loading ? (
              <ActivityIndicator size="small" style={styles.loading} />
            ) : (
              <Image source={require('assets/icons/16/chevron-down.png')} style={styles.icon__more} />
            )}
          </View>
        </TouchableHighlight>
        <View style={styles[`divider${item.level}`]} />
        <View style={styles.border} />
      </View>
    );
  }
}
