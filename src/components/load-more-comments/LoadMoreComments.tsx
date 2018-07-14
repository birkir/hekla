import * as React from 'react';
import { View, Text, Image, TouchableHighlight, LayoutAnimation, StyleSheet } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import { theme } from 'styles';
const styles = theme(require('./LoadMoreComments.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
  hidden: boolean;
  onPress?: (item: IItemType) => void;
  testID?: string;
}

export default class LoadMoreComments extends React.PureComponent<Props> {

  @autobind
  onPress() {
    this.props.onPress(this.props);
  }

  render() {
    const { hidden, item } = this.props;
    const total = item.unfetched;

    if (hidden) {
      return null;
    }

    return (
      <View style={styles.host}>
        <TouchableHighlight
          onPress={this.onPress}
          activeOpacity={1}
          underlayColor="#F2F1F6"
          style={styles.content}
        >
          <View style={[styles.container, styles[`level${item.level}`]]}>
            <Text style={styles.text}>{total} more {total === 1 ? 'reply' : 'replies'} {item.by}</Text>
            <Image source={require('assets/icons/16/chevron-down.png')} style={styles.icon__more} />
          </View>
        </TouchableHighlight>
        <View style={styles[`divider${item.level}`]} />
        <View style={styles.border} />
      </View>
    );
  }
}
