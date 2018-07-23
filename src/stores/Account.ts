import { flow, types, applySnapshot } from 'mobx-state-tree';
import { AsyncStorage, Platform } from 'react-native';
import { Sentry } from 'react-native-sentry';
import CookieManager from 'react-native-cookies';
import * as Keychain from 'react-native-keychain';
import Hackernews, { API_URL, LOGIN_INCORRECT, LOGIN_ERROR, LOGIN_EXISTS } from './services/Hackernews';
import User from './models/User';
import Users from './Users';

const Account = types
  .model('Account', {
    isLoggedIn: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
    isChecking: types.optional(types.boolean, true),
    voted: types.optional(types.map(types.boolean), {}),
    favorited: types.optional(types.map(types.boolean), {}),
    flagged: types.optional(types.map(types.boolean), {}),
    hidden: types.optional(types.map(types.boolean), {}),
    read: types.optional(types.map(types.boolean), {}),
    user: types.maybe(types.reference(User)),
  })
  .views(self => ({
    get userId() {
      return self.user && self.user.id;
    },
  }))
  .actions((self) => {

    const populate = flow(function* () {
      // Mark every item in list
      const add = (where, items) => items.forEach(({ id }) => where.set(id, true));

      // Sync last 30 voted stories
      add(self.voted, yield Hackernews.voted('submissions', self.user.id, 1));

      // Sync last 90 voted comments
      for (let page = 1; page < 3; page += 1) {
        add(self.voted, yield Hackernews.voted('comments', self.user.id, page));
      }

      // Sync last 30 favorited stories
      add(self.favorited, yield Hackernews.favorites('submissions', self.user.id, 1));

      // Sync last 90 favorited comments
      for (let page = 1; page < 3; page += 1) {
        add(self.favorited, yield Hackernews.favorites('comments', self.user.id, page));
      }

      for (let page = 1; page < 3; page += 1) {
        add(self.hidden, yield Hackernews.hidden(page));
      }
    });

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

      // TODO: Lets not always populate this on login
      // Keep a cache and then low-priority sync
      populate();

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
      toggle(id: string, who: string, flag?: boolean) {
        const isInList = self[who].get(id);
        self[who].set(id, typeof flag === 'undefined' ? !isInList : flag);
      },
      setIsChecking(flag: boolean) {
        self.isChecking = flag;
      },
    };
  })
  .create();

/**
 * BOOTSTRAP ACCOUNT
 */
(async () => {
  Account.setIsChecking(true);

  try {
    const data = JSON.parse(await AsyncStorage.getItem('Account'));
    applySnapshot(Account.read, data.read);
    applySnapshot(Account.voted, data.voted);
    applySnapshot(Account.favorited, data.favorited);
    applySnapshot(Account.flagged, data.flagged);
    applySnapshot(Account.hidden, data.hidden);
  } catch (err) {
    console.log('Could not decode Account');
  }

  let username;
  let password;

  try {
    const credentials = await Keychain.getInternetCredentials('news.ycombinator.com');
    if (credentials) {
      username = credentials.username;
      password = credentials.password;
    } else {
      Account.setIsChecking(false);
      return false;
    }
  } catch (err) {
    Sentry.captureException(err);
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

  try {
    await Account.login(username, password);
  } catch (err) {
    Sentry.captureException(err);
  }

  username = null;
  password = null;

  Account.setIsChecking(false);
})();

export default Account;
