import * as React from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, Platform, TouchableWithoutFeedback } from 'react-native';
import { autobind } from 'core-decorators';
import Item from 'stores/models/Item';
import FormatText from 'components/format-text/FormatText';
import Element from 'components/element/Element';
import MetaLink from 'components/meta-link/MetaLink';
import { observer } from 'mobx-react';
import { theme, getVar } from 'styles';
const styles = theme(require('./CommentCard.styl'));

type IItemType = typeof Item.Type;

interface Props {
  key: string;
  item: IItemType;
  parent: IItemType;
  testID?: string;
}

interface State {
  underlay: boolean;
  loaded: boolean;
  loading: boolean;
}

@observer
export default class CommentCard extends React.Component<Props> {

  elementId = `element_${this.props.item.id}`;

  @autobind
  onPress() {
    // clearTimeout(this.pressInTimer);
    // return storyScreen(this.props.item);
  }

  @autobind
  onPressIn() {
    if (Platform.OS === 'ios') {
      // storyScreen(this.props.item, this.elementId),
    }

    return;
  }

  @autobind
  onMorePress() {

  }

  renderParent() {
    const { by, title, text, prettyText } = this.props.parent;
    return (
      <View style={styles.parent}>
        {text ? (
          <FormatText
            noLinks={true}
            noFormat={true}
            numberOfLines={5}
            style={styles.parent__text}
          >
            {prettyText}
          </FormatText>
        ) : (
          <Text style={styles.parent__title}>{title}</Text>
        )}
        <Text style={styles.parent__author}>{by}</Text>
      </View>
    );
  }

  render() {
    const { item, parent, testID } = this.props;
    const { ago, by, prettyText } = item;
    return (
      <Element elementId={this.elementId}>
        <TouchableHighlight
          accessibilityComponentType="button"
          testID={testID}
          onPress={this.onPress}
          onPressIn={this.onPressIn}
          style={styles.host}
          activeOpacity={1}
          underlayColor={getVar('--content-bg-active-color', 'gray')}
        >
          <View style={styles.container}>
            <View style={styles.row}>
              {/* <TouchableOpacity onPress={this.onUserPress}> */}
                <Text style={styles.author}>{by}</Text>
              {/* </TouchableOpacity> */}
              {/* {isUserVote && <Image style={styles.icon__arrow} source={require('assets/icons/16/arrow-up.png')} />} */}
              <View style={styles.flex} />
              <TouchableWithoutFeedback onPress={this.onMorePress}>
                <Image source={require('assets/icons/16/more.png')} style={styles.icon__more} />
              </TouchableWithoutFeedback>
              <Text style={styles.ago}>{ago}</Text>
            </View>
            <FormatText
              noLinks={true}
              noFormat={true}
              numberOfLines={10}
              style={styles.text}
            >
              {prettyText}
            </FormatText>
            {parent && this.renderParent()}
          </View>
        </TouchableHighlight>
      </Element>
    );
  }
}
