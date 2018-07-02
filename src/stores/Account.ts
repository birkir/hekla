import { flow, types } from 'mobx-state-tree';
import { AsyncStorage, Platform } from 'react-native';
import CookieManager from 'react-native-cookies'; // tslint:disable-line import-name
import * as Keychain from 'react-native-keychain';
import Hackernews, { API_URL, LOGIN_INCORRECT, LOGIN_ERROR, LOGIN_EXISTS } from './services/Hackernews';
import User from './models/User';
import Users from './Users';

const Account = types
  .model('Account', {
    isLoggedIn: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
    isChecking: types.optional(types.boolean, true),
    user: types.maybe(types.reference(User)),
  })
  .actions((self) => {

    const login = flow(function* (username, password) {
      self.isLoading = true;
      const login = yield Hackernews.login(username, password);

      if (login === LOGIN_INCORRECT) {
        self.isLoading = false;
        throw new Error('The username and password combination did not work. Please try again.');
      }

      if (login === LOGIN_ERROR) {
        self.isLoading = false;
        throw new Error('Unknown server error');
      }

      if (login === LOGIN_EXISTS) {
        // Should we do something here?
      }

      const cookie = yield CookieManager.get(API_URL);

      if (cookie) {
        yield AsyncStorage.setItem('UserCookie', JSON.stringify(cookie));
      }

      try {
        yield Keychain.setInternetCredentials('news.ycombinator.com', username, password);
      } catch (err) {
        console.log('Failed storing credentials in keychain: %o', err);
      }

      self.user = yield Users.fetchUserById(username);
      self.isLoading = false;
      self.isLoggedIn = true;

      return true;
    });

    const logout = flow(function* () {
      self.isLoggedIn = false;

      const success = yield Hackernews.logout();

      if (success) {
        Keychain.resetInternetCredentials('news.ycombinator.com');
        CookieManager.clearAll();
      }

      return true;
    });

    return {
      login,
      logout,
      setIsChecking(flag: boolean) {
        self.isChecking = flag;
      },
    };
  })
  .create();

console.log(Account);

/**
 * BOOTSTRAP ACCOUNT
 */
(async () => {
  Account.setIsChecking(true);
  let username;
  let password;

  try {
    const credentials = await Keychain.getInternetCredentials('news.ycombinator.com');
    if (credentials) {
      username = credentials.username;
      password = credentials.password;
    } else {
      Account.setIsChecking(false);
      console.log('Failed fetching credeentials from keychain. User aborted.');
      return false;
    }
  } catch (err) {
    console.log('Failed fetching credeentials from keychain: %o', err);
    Account.setIsChecking(false);
    return false;
  }

  const addOneYear = +new Date() + (86400 * 365.25 * 1000);
  const userCookie = JSON.parse(await AsyncStorage.getItem('UserCookie')) || {};
  if (Platform.OS === 'ios' && userCookie.user) {
    CookieManager.set({
      name: 'user',
      value: userCookie.user,
      domain: '*.ycombinator.com',
      origin: API_URL,
      path: '/',
      version: '1',
      expiration: (new Date(addOneYear)).toISOString(),
    });
  }

  await Account.login(username, password);
  Account.setIsChecking(false);
})();

export default Account;
