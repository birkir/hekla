import * as React from 'react';
import { View, Text, NativeModules, Image, KeyboardAvoidingView, ScrollView, Alert, Keyboard } from 'react-native';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import Button from 'components/button/Button';
import Loading from 'components/loading/Loading';
import Account from 'stores/Account';
import { Navigation } from 'react-native-navigation';
import prettyNumber from 'utils/prettyNumber';
import Input from './components/Input';
import { when } from 'mobx';
import { theme, applyThemeOptions } from 'styles';
import { userSubmissionsScreen, userCommentsScreen, userFavoritesScreen, accountVotedScreen, accountHiddenScreen } from 'screens';
const styles = theme(require('./Account.styl'));

interface Props {
  componentId: string;
  testID?: string;
}

@observer
export default class AccountScreen extends React.Component<Props> {

  private passwordRef;

  state = {
    username: '',
    password: '',
    loading: false,
  };

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: Account.isLoggedIn ? Account.user.id : 'Account',
        },
        rightButtons: Account.isLoggedIn ? [
          {
            id: 'logout',
            title: 'Logout',
          },
        ] : [],
      },
    });
  }

  componentDidMount() {
    when(
      () => Account.user && Account.user.id !== null,
      this.updateOptions,
    );
  }

  componentDidAppear() {
    this.updateOptions();
  }

  @autobind
  updateOptions() {
    Navigation.mergeOptions(this.props.componentId, AccountScreen.options);
  }

  onNavigationButtonPressed(buttonId) {
    if (buttonId === 'logout') {
      this.logout();
    }
  }

  @autobind
  async login() {
    Keyboard.dismiss();
    try {
      const user = await Account.login(this.state.username, this.state.password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    }
    Navigation.mergeOptions(this.props.componentId, AccountScreen.options);
  }

  logout() {
    Account.logout();
    Navigation.mergeOptions(this.props.componentId, AccountScreen.options);
  }

  @autobind
  onSignInPress() {
    this.login();
  }

  @autobind
  onCreateAccountPress() {
    NativeModules.RNUeno.openSafari(
      this.props.componentId,
      'https://news.ycombinator.com/login?goto=news',
      null,
    );
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

  @autobind
  onSubmissionsPress() {
    return userSubmissionsScreen(Account.user.id);
  }

  @autobind
  onCommentsPress() {
    return userCommentsScreen(Account.user.id);
  }

  @autobind
  onHiddenPress() {
    return accountHiddenScreen();
  }

  @autobind
  onVotedPress() {
    return accountVotedScreen(Account.user.id);
  }

  @autobind
  onFavoritesPress() {
    return userFavoritesScreen(Account.user.id);
  }

  renderLogin() {
    return (
      <ScrollView style={styles.flex} contentContainerStyle={styles.login}>
        <KeyboardAvoidingView behavior="padding" style={styles.container} keyboardVerticalOffset={140}>
          <Image style={styles.login__logo} source={require('assets/icons/128/hacker-news-logo.png')} />
          <Text style={styles.login__text}>Sign In to access your Hacker News account to vote, post, comment and more!</Text>
          <View style={styles.login__button}>
            <Input
              placeholder="Username"
              returnKeyType="next"
              onSubmitEditing={this.onUsernameSubmitEditing}
              onChangeText={this.onUsernameChangeText}
            />
          </View>
          <View style={styles.login__button}>
            <Input
              placeholder="Password"
              returnKeyType="done"
              secureTextEntry={true}
              innerRef={this.onPasswordRef}
              onChangeText={this.onPasswordChangeText}
              onSubmitEditing={this.onPasswordSubmitEditing}
            />
          </View>
          <View style={styles.login__button}>
            <Button fill={true} onPress={this.onSignInPress} title="Sign In" loading={Account.isLoading} />
          </View>
          <Button onPress={this.onCreateAccountPress} title="Create Account" />
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }

  render() {
    const { testID } = this.props;

    if (Account.isChecking) {
      return (
        <View style={[styles.host, styles.host__container]}>
          <Loading />
        </View>
      );
    }

    if (!Account.isLoggedIn) {
      return this.renderLogin();
    }

    return (
      <ScrollView style={styles.host} testID={testID} contentContainerStyle={styles.host__container}>
        <CellGroup header={Account.user.id}>
          <Cell
            title="Karma"
            value={prettyNumber(Account.user.karma)}
          />
          <Cell
            title="Account age"
            value={Account.user.age}
          />
          <Cell title="About" value={Account.user.about} />
        </CellGroup>
        <CellGroup header={true}>
          <Cell
            title="Submissions"
            onPress={this.onSubmissionsPress}
            more={true}
          />
          <Cell
            title="Comments"
            onPress={this.onCommentsPress}
            more={true}
          />
          <Cell
            title="Hidden"
            onPress={this.onHiddenPress}
            more={true}
          />
          <Cell
            title="Voted"
            onPress={this.onVotedPress}
            more={true}
          />
          <Cell
            title="Favorites"
            onPress={this.onFavoritesPress}
            more={true}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
