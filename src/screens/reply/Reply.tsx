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
  private timer;

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: 'New Comment',
        },
        leftButtons: [
          {
            id: 'cancel',
            text: 'Cancel',
          },
        ],
        rightButtons: [
          {
            id: 'post',
            text: 'Post',
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
    isEmpty: true,
  };

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

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
    const opts = ReplyScreen.options;
    opts.topBar.rightButtons[0].color = this.state.text.length > 0 ? undefined : '#ccc';
    Navigation.mergeOptions(this.props.componentId, opts);
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
      keyboardHeight: Math.max(0, height + 48), // Make room for undetectable keyboard attachments
    });
  }

  navigationButtonPressed({ buttonId }) {

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
      textHeight: e.nativeEvent.contentSize.height + 33,
    });
  }

  @autobind
  onTextChange(text) {
    clearTimeout(this.timer);
    this.setState({ text }, () => {
      this.timer = setTimeout(this.updateOptions, text.length < 2 ? 0 : 2000);
    });
  }

  render() {
    const { item } = this.state;
    const { testID } = this.props;
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
      <View style={styles.flex} onLayout={this.onHostLayout} testID={testID}>
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
