import * as React from 'react';
import { View, ScrollView, Image, Text, Keyboard, LayoutAnimation } from 'react-native';
import { observer } from 'mobx-react';
import Input from './components/Input';
import Button from 'components/button/Button';
import { autobind } from 'core-decorators';
import Account from 'stores/Account';
import UI from 'stores/UI';
import { theme } from 'styles';
const styles = theme(require('./Login.styl'));

interface Props {
  testID?: string;
  onLogin?: (username: string, password: string) => void;
  onLogout?: () => void;
}

@observer
export default class Login extends React.Component<Props> {

  private passwordRef;
  private keyboardWillChangeFrameHandler;

  state = {
    username: '',
    password: '',
    height: 0,
  };

  componentWillMount() {
    this.keyboardWillChangeFrameHandler = Keyboard.addListener('keyboardWillChangeFrame', this.onKeyboardWillChangeFrame);
  }

  componentWillUnmount() {
    this.keyboardWillChangeFrameHandler.remove();
  }

  @autobind
  login() {
    Keyboard.dismiss();

    if (typeof this.props.onLogin === 'function') {
      this.props.onLogin(this.state.username, this.state.password);
    }
  }

  logout() {
    if (typeof this.props.onLogout === 'function') {
      this.props.onLogout();
    }
  }

  @autobind
  onKeyboardWillChangeFrame(e) {
    const { startCoordinates, endCoordinates } = e;
    const height = startCoordinates.screenY - endCoordinates.screenY;
    if (height < 0 || height > 0) {
      LayoutAnimation.easeInEaseOut();
      this.setState({ height });
    }
  }

  @autobind
  onSignInPress() {
    this.login();
  }

  @autobind
  onCreateAccountPress() {
    UI.openURL('https://news.ycombinator.com/login?goto=news');
  }

  @autobind
  onPasswordRef(ref) {
    this.passwordRef = ref;
  }

  @autobind
  onUsernameChangeText(text) {
    this.setState({
      username: text,
    });
  }

  @autobind
  onPasswordChangeText(text) {
    this.setState({
      password: text,
    });
  }

  @autobind
  onUsernameSubmitEditing() {
    this.passwordRef.focus();
  }

  @autobind
  onPasswordSubmitEditing() {
    this.login();
  }

  render() {
    return (
      <ScrollView
        style={styles.host}
        contentContainerStyle={styles.container}
        centerContent={true}
      >
        <View style={styles.login}>
          <Image style={styles.logo} source={require('assets/icons/128/hacker-news-logo.png')} />
          <Text style={styles.text}>Sign In to access your Hacker News account to vote, post, comment and more!</Text>
          <View style={styles.button}>
            <Input
              placeholder="Username"
              returnKeyType="next"
              onSubmitEditing={this.onUsernameSubmitEditing}
              onChangeText={this.onUsernameChangeText}
            />
          </View>
          <View style={styles.button}>
            <Input
              placeholder="Password"
              returnKeyType="done"
              secureTextEntry={true}
              innerRef={this.onPasswordRef}
              onChangeText={this.onPasswordChangeText}
              onSubmitEditing={this.onPasswordSubmitEditing}
            />
          </View>
          <View style={styles.button}>
            <Button fill={true} onPress={this.onSignInPress} title="Sign In" loading={Account.isLoading} />
          </View>
          <View style={styles.button}>
            <Button onPress={this.onCreateAccountPress} title="Create Account" />
          </View>
          <View style={{ height: this.state.height }} />
        </View>
      </ScrollView>
    );
  }
}
