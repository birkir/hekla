import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import CellIcon from 'components/cell/CellIcon';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import Loading from 'components/loading/Loading';
import Account from 'stores/Account';
import { Navigation } from 'react-native-navigation';
import prettyNumber from 'utils/prettyNumber';
import { when } from 'mobx';
import { theme, applyThemeOptions, getVar } from 'styles';
import { userSubmissionsScreen, userCommentsScreen, userFavoritesScreen, accountVotedScreen, accountHiddenScreen } from 'screens';
import Login from './Login';
import UI from 'stores/UI';
const styles = theme(require('./Account.styl'));

interface Props {
  componentId: string;
  testID?: string;
}

@observer
export default class AccountScreen extends React.Component<Props> {

  static get options() {
    return applyThemeOptions({
      topBar: {
        title: {
          text: Account.isLoggedIn ? Account.user.id : 'Account',
        },
        rightButtons: Account.isLoggedIn ? [
          {
            id: 'logout',
            text: 'Logout',
          },
        ] : [],
      },
      bottomTab: {
        text: 'Account',
        testID: 'ACCOUNT_TAB',
        icon: require('assets/icons/25/user.png'),
      },
    });
  }

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentWillMount() {
    UI.addScreen(this);
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

  componentWillUnmount() {
    UI.removeScreen(this);
  }

  @autobind
  updateOptions() {
    const opts = AccountScreen.options;
    console.log('updateOptions', opts);
    Navigation.mergeOptions(this.props.componentId, opts);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'logout') {
      this.onLogout();
    }
  }

  async onLogin(username, password) {
    try {
      const user = await Account.login(username, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    }
  }

  onLogout() {
    Account.logout();
    this.updateOptions();
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
      return (
        <Login
          onLogin={this.onLogin}
          onLogout={this.onLogout}
        />
      );
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
            left={
              <CellIcon
                source={require('assets/icons/32/submissions.png')}
                tintColor={getVar('--tint-bg')}
                size={21}
              />
            }
            onPress={this.onSubmissionsPress}
            more={true}
          />
          <Cell
            title="Comments"
            left={
              <CellIcon
                source={require('assets/icons/32/comments.png')}
                tintColor={getVar('--tint-bg')}
                size={21}
              />
            }
            onPress={this.onCommentsPress}
            more={true}
          />
          <Cell
            title="Hidden"
            left={
              <CellIcon
                source={require('assets/icons/32/hide.png')}
                tintColor={getVar('--tint-bg')}
                size={24}
              />
            }
            onPress={this.onHiddenPress}
            more={true}
          />
          <Cell
            title="Voted"
            left={
              <CellIcon
                source={require('assets/icons/32/arrow-up.png')}
                tintColor={getVar('--tint-bg')}
                size={24}
              />
            }
            onPress={this.onVotedPress}
            more={true}
          />
          <Cell
            title="Favorites"
            left={
              <CellIcon
                source={require('assets/icons/32/star.png')}
                tintColor={getVar('--tint-bg')}
                size={21}
              />
            }
            onPress={this.onFavoritesPress}
            more={true}
          />
        </CellGroup>
      </ScrollView>
    );
  }
}
