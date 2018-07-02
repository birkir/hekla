import { Navigation } from 'react-native-navigation';
import { Platform, StatusBar, PlatformIOS, PlatformIOSStatic } from 'react-native';
import TopBarSearch from '../components/top-bar-search/TopBarSearch';
import Stories from './stories/Stories';
import Story from './story/Story';
import Search from './search/Search';
import Account from './account/Account';
import AccountHidden from './account/Hidden';
import AccountVoted from './account/Voted';
import Reply from './reply/Reply';
import Settings from './settings/Settings';
import SettingsGeneral from './settings/General';
import SettingsAppearance from './settings/Appearance';
import User from './user/User';
import UserSubmissions from './user/Submissions';
import UserComments from './user/Comments';
import UserFavorites from './user/Favorites';
import UI from '../stores/UI';
import Item from '../stores/models/Item';
import prettyNumber from 'utils/prettyNumber';

type IItemType = typeof Item.Type;

export const STORIES_SCREEN = 'hekla.StoriesScreen';
export const STORY_SCREEN = 'hekla.StoryScreen';
export const SEARCH_SCREEN = 'hekla.SearchScreen';
export const ACCOUNT_SCREEN = 'hekla.AccountScreen';
export const ACCOUNT_HIDDEN_SCREEN = 'hekla.AccountHiddenScreen';
export const ACCOUNT_VOTED_SCREEN = 'hekla.AccountVotedScreen';
export const REPLY_SCREEN = 'hekla.ReplyScreen';
export const SETTINGS_SCREEN = 'hekla.SettingsScreen';
export const SETTINGS_GENERAL_SCREEN = 'hekla.SettingsGeneralScreen';
export const SETTINGS_APPEARANCE_SCREEN = 'hekla.SettingsAppearanceScreen';
export const USER_SCREEN = 'hekla.UserScreen';
export const USER_SUBMISSIONS_SCREEN = 'hekla.UserSubmissionsScreen';
export const USER_COMMENTS_SCREEN = 'hekla.UserCommentsScreen';
export const USER_FAVORITES_SCREEN = 'hekla.UserFavoritesScreen';
export const TOP_BAR_SEARCH = 'hekla.TopBarSearch';

export const Screens = new Map();
Screens.set(STORIES_SCREEN, Stories);
Screens.set(STORY_SCREEN, Story);
Screens.set(SEARCH_SCREEN, Search);
Screens.set(ACCOUNT_SCREEN, Account);
Screens.set(ACCOUNT_HIDDEN_SCREEN, AccountHidden);
Screens.set(ACCOUNT_VOTED_SCREEN, AccountVoted);
Screens.set(REPLY_SCREEN, Reply);
Screens.set(SETTINGS_SCREEN, Settings);
Screens.set(SETTINGS_GENERAL_SCREEN, SettingsGeneral);
Screens.set(SETTINGS_APPEARANCE_SCREEN, SettingsAppearance);
Screens.set(USER_SCREEN, User);
Screens.set(USER_SUBMISSIONS_SCREEN, UserSubmissions);
Screens.set(USER_COMMENTS_SCREEN, UserComments);
Screens.set(USER_FAVORITES_SCREEN, UserFavorites);
Screens.set(TOP_BAR_SEARCH, TopBarSearch);

export const startApp = () => {
  StatusBar.setBarStyle('dark-content', true);

  const tabs = [
    {
      stack: {
        children: [{
          component: {
            name: STORIES_SCREEN,
          },
        }],
        options: {
          bottomTab: {
            title: 'Stories',
            testID: 'STORIES_TAB',
            icon: require('assets/icons/25/stories.png'),
          },
        },
      },
    },
    {
      stack: {
        children: [{
          component: {
            name: ACCOUNT_SCREEN,
          },
        }],
        options: {
          bottomTab: {
            title: 'Account',
            testID: 'ACCOUNT_TAB',
            icon: require('assets/icons/25/user.png'),
          },
        },
      },
    }, {
      stack: {
        children: [{
          component: {
            name: SEARCH_SCREEN,
          },
        }],
        options: {
          bottomTab: {
            title: 'Settings',
            testID: 'SEARCH_TAB',
            icon: require('assets/icons/25/search.png'),
          },
        },
      },
    }, {
      stack: {
        children: [{
          component: {
            name: SETTINGS_SCREEN,
          },
        }],
        options: {
          bottomTab: {
            title: 'Settings',
            testID: 'SETTINGS_TAB',
            icon: require('assets/icons/25/settings.png'),
          },
        },
      },
    },
  ];

  if (UI.isIpad) {
    return Navigation.setRoot({
      root: {
        splitView: {
          id: 'SPLIT_VIEW',
          master: {
            stack: {
              id: 'MASTER_ID',
              children: [
                {
                  component: {
                    name: STORIES_SCREEN,
                  },
                },
              ],
            },
          },
          detail: {
            bottomTabs: {
              children: tabs.slice(1),
            },
          },
        },
      },
    });
  }

  return Navigation.setRoot({
    root: {
      bottomTabs: {
        id: 'ROOT',
        children: tabs,
      },
    },
  });
};

export const replyScreen = (itemId: string, edit: boolean = false) => Navigation.showModal({
  stack: {
    children: [
      {
        component: {
          name: REPLY_SCREEN,
          passProps: {
            itemId,
            edit,
          },
        },
      },
    ],
  },
});

export const userScreen = (id: string) => Navigation.push(UI.componentId, {
  component: {
    name: USER_SCREEN,
    passProps: {
      id,
    },
    options: {
      topBar: {
        title: {
          text: id,
        },
      },
    },
  },
});

export const userSubmissionsScreen = (userId: string) => Navigation.push(UI.componentId, {
  component: {
    name: USER_SUBMISSIONS_SCREEN,
    passProps: {
      userId,
    },
  },
});

export const userCommentsScreen = (userId: string) => Navigation.push(UI.componentId, {
  component: {
    name: USER_COMMENTS_SCREEN,
    passProps: {
      userId,
    },
  },
});

export const userFavoritesScreen = (userId: string) => Navigation.push(UI.componentId, {
  component: {
    name: USER_FAVORITES_SCREEN,
    passProps: {
      userId,
    },
  },
});

export const accountHiddenScreen = () => Navigation.push(UI.componentId, {
  component: {
    name: ACCOUNT_HIDDEN_SCREEN,
  },
});

export const accountVotedScreen = (userId: string) => Navigation.push(UI.componentId, {
  component: {
    name: ACCOUNT_VOTED_SCREEN,
    passProps: {
      userId,
    },
  },
});

export const storyScreen = (story: IItemType | string, elementId?: string) => {
  const id = typeof story === 'object' ? story.id : story;
  const comments = typeof story === 'object' ? story.descendants || 0 : null;

  return Navigation.push(UI.componentId, {
    component: {
      name: STORY_SCREEN,
      passProps: {
        id: story.id,
      },
      options: {
        topBar: {
          title: {
            text: comments ? prettyNumber(comments, 'Comments') : undefined,
          },
        },
        preview: elementId ? {
          elementId,
          commit: true,
        } : undefined,
      },
    },
  });
};
