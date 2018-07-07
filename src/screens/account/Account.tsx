import * as React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Cell from 'components/cell/Cell';
import CellGroup from 'components/cell/CellGroup';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import Loading from 'components/loading/Loading';
import Account from 'stores/Account';
import { Navigation } from 'react-native-navigation';
import prettyNumber from 'utils/prettyNumber';
import { when } from 'mobx';
import { theme, applyThemeOptions } from 'styles';
import { userSubmissionsScreen, userCommentsScreen, userFavoritesScreen, accountVotedScreen, accountHiddenScreen } from 'screens';
import Login from './Login';
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
            title: 'Logout',
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
