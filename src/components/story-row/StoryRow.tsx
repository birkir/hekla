import * as React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { autobind } from 'core-decorators';
import { observer } from 'mobx-react';
import Item from 'stores/models/Item';
import { theme } from 'styles';
import { userScreen } from 'screens';
const styles = theme(require('./StoryRow.styl'));

type IItemType = typeof Item.Type;

interface Props {
  item: IItemType;
  testID?: string;
}

@observer
export default class StoryRow extends React.Component<Props> {

  @autobind
  onVotePress() {
    this.props.item.vote();
  }

  @autobind
  onUserPress() {
    return userScreen(this.props.item.by);
  }

  render() {
    const { item, testID } = this.props;
    const { ago, by, descendants, score } = item;

    return (
      <View style={styles.row} testID={testID}>
        <View style={styles.row__left}>
          <TouchableOpacity onPress={this.onUserPress}>
            <Text style={styles.row__author}>{by}</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Image style={[styles.row__icon, item.isVoted && styles.row__icon__active]} source={require('assets/icons/16/arrow-up.png')} />
            <Text style={[styles.row__text, item.isVoted && styles.row__text__active]}>{score}</Text>
            <Image style={styles.row__icon} source={require('assets/icons/16/comments.png')} />
            <Text style={styles.row__text}>{descendants}</Text>
            <Image style={styles.row__icon} source={require('assets/icons/16/clock.png')} />
            <Text style={styles.row__text}>{ago}</Text>
          </View>
        </View>
        <View style={styles.row__actions}>
          <TouchableOpacity onPress={this.onVotePress} style={styles.row__action}>
            <Image style={[styles.row__action__icon, item.isVoted && styles.row__action__active]} source={require('assets/icons/32/arrow-up.png')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
