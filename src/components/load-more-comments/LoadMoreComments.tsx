import * as React from 'react';
import { View, Text, Image, TouchableHighlight, LayoutAnimation, StyleSheet } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
const styles = require('./LoadMoreComments.styl');

type IItemType = typeof Item.Type;

interface Props {
  key?: string;
  item: IItemType;
  depth: number;
  hidden: boolean;
  onPress?: (item: IItemType) => void;
  testID?: string;
}

export default class LoadMoreComments extends React.PureComponent<Props> {

  @autobind
  onPress() {
    this.props.onPress(this.props);
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut();
  }

  render() {
    const { hidden, depth, item } = this.props;

    if (hidden || item.kids.length - item.request.offset <= 0) {
      return null;
    }

    const total = item.kids.length - item.request.offset;

    return (
      <View style={styles.host}>
        <TouchableHighlight
          onPress={this.onPress}
          activeOpacity={1}
          underlayColor="#F2F1F6"
          style={styles.content}
        >
          <View style={[styles.container, styles[`level${depth}`]]}>
            <Text style={styles.text}>{total} more {total === 1 ? 'reply' : 'replies'}</Text>
            <Image source={require('assets/icons/16/chevron-down.png')} style={styles.icon__more} />
          </View>
        </TouchableHighlight>
        <View style={[styles[`divider${depth}`], { height: StyleSheet.hairlineWidth }]} />
      </View>
    );
  }
}
