import * as React from 'react';
import { View, Text, TextInput, Keyboard, ScrollView, Dimensions, LayoutAnimation } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { autobind } from 'core-decorators';
import FormatText from 'components/format-text/FormatText';
import Items from 'stores/Items';
import { theme, applyThemeOptions } from 'styles';
const styles = theme(require('./Reply.styl'));

interface Props {
  children?: React.ReactNode;
  itemId?: string;
  edit?: boolean;
  componentId: string;
  testID?: string;
}

export default class ReplyScreen extends React.Component<Props> {

  private keyboardWillChangeFrameHandler;

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'New Comment',
        },
        leftButtons: [
          {
            id: 'cancel',
            title: 'Cancel',
          },
        ],
        rightButtons: [
          {
            id: 'post',
            title: 'Post',
            fontFamily: 'Helvetica-Bold',
            color: '#CCC',
          },
        ],
      },
    });
  }

  state = {
    text: '',
    item: null,
    textHeight: 100,
    keyboardHeight: 0,
    commentHeight: 0,
    screenHeight: Dimensions.get('window').height,
    isLoading: false,
  };

  componentDidAppear() {
    this.updateOptions();
  }

  componentWillMount() {
    this.keyboardWillChangeFrameHandler = Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardWillChangeFrame);
    Items.fetchItem(this.props.itemId)
      .then(item => this.setState({ item }));
  }

  componentWillUnmount() {
    this.keyboardWillChangeFrameHandler.remove();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, ReplyScreen.options);
  }

  @autobind
  async post() {
    this.state.item.reply(this.state.text);
    this.dismiss();
  }

  @autobind
  dismiss() {
    Keyboard.dismiss();
    Navigation.dismissModal(this.props.componentId);
  }

  @autobind
  onCommentLayout(e) {
    this.setState({
      commentHeight: e.nativeEvent.layout.height,
    });
  }

  @autobind
  onHostLayout(e) {
    this.setState({
      screenHeight: e.nativeEvent.layout.height,
    });
  }

  @autobind
  onKeyboardWillChangeFrame(e) {
    const { startCoordinates, endCoordinates } = e;
    const height = startCoordinates.screenY - endCoordinates.screenY;
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    this.setState({
      keyboardOpen: height > 0,
      keyboardHeight: Math.max(0, height),
    });
  }

  onNavigationButtonPressed(buttonId) {

    if (buttonId === 'cancel') {
      this.dismiss();
    }

    if (buttonId === 'post' && this.state.text !== '') {
      this.post();
    }
  }

  @autobind
  onTextInputSizeChange(e) {
    this.setState({
      textHeight: e.nativeEvent.contentSize.height + 20,
    });
  }

  @autobind
  onTextChange(text) {
    if (this.state.text === '' || text === '') {
      const active = text !== '';
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [{
            id: 'post',
            title: 'Post',
            fontFamily: 'Helvetica-Bold',
            color: active ? undefined : '#CCC',
          }],
        },
      });
    }

    this.setState({
      text,
    });
  }

  render() {
    const { item } = this.state;
    const { children, testID } = this.props;
    const { screenHeight, commentHeight, keyboardHeight, textHeight } = this.state;
    const minHeight = Math.max(125, screenHeight - commentHeight - keyboardHeight);

    if (this.props.edit) {
      return (
        <View>
          <Text>Not yet supported...</Text>
        </View>
      );
    }

    return (
      <View style={styles.flex} onLayout={this.onHostLayout}>
        <ScrollView style={styles.flex}>
          <TextInput
            style={[styles.input, { minHeight, height: textHeight }]}
            multiline={true}
            autoFocus={true}
            onContentSizeChange={this.onTextInputSizeChange}
            onChangeText={this.onTextChange}
          />
          {item && item.text && (
            <View style={styles.comment} onLayout={this.onCommentLayout}>
              <FormatText noLinks={true} style={styles.comment__text}>{item.prettyText}</FormatText>
            </View>
          )}
          <View style={{ height: keyboardHeight }} />
        </ScrollView>
      </View>
    );
  }
}
