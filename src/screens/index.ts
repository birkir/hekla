import { StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Stories from './stories/Stories';
import Story from './story/Story';
import Search from './search/Search';
import Result from './search/Result';
import Account from './account/Account';
import AccountHidden from './account/Hidden';
import AccountVoted from './account/Voted';
import Reply from './reply/Reply';
import Settings from './settings/Settings';
import SettingsGeneral from './settings/General';
import SettingsAppearance from './settings/Appearance';
import SettingsThemeScreen from './settings/Theme';
import SettingsDonate from './settings/Donate';
import SettingsAbout from './settings/About';
import User from './user/User';
import UserSubmissions from './user/Submissions';
import UserComments from './user/Comments';
import UserFavorites from './user/Favorites';
import IPad from './misc/IPad';
import UI from '../stores/UI';
import Item from '../stores/models/Item';
import prettyNumber from 'utils/prettyNumber';
import { getVar } from 'styles';
import { when } from 'mobx';

type IItemType = typeof Item.Type;

type StoryScreenProps = {
  id: string | number;
  descendants?: number;
  isMasterView?: boolean;
  reactTag?: number;
};

export const STORIES_SCREEN = 'hekla.StoriesScreen';
export const STORY_SCREEN = 'hekla.StoryScreen';
export const SEARCH_SCREEN = 'hekla.SearchScreen';
export const RESULT_SCREEN = 'hekla.ResultScreen';
export const ACCOUNT_SCREEN = 'hekla.AccountScreen';
export const ACCOUNT_HIDDEN_SCREEN = 'hekla.AccountHiddenScreen';
export const ACCOUNT_VOTED_SCREEN = 'hekla.AccountVotedScreen';
export const REPLY_SCREEN = 'hekla.ReplyScreen';
export const SETTINGS_SCREEN = 'hekla.SettingsScreen';
export const SETTINGS_GENERAL_SCREEN = 'hekla.SettingsGeneralScreen';
export const SETTINGS_APPEARANCE_SCREEN = 'hekla.SettingsAppearanceScreen';
export const SETTINGS_THEME_SCREEN = 'hekla.SettingsThemeScreen';
export const SETTINGS_ABOUT_SCREEN = 'hekla.SettingsAboutScreen';
export const SETTINGS_DONATE_SCREEN = 'hekla.SettingsDonateScreen';
export const USER_SCREEN = 'hekla.UserScreen';
export const USER_SUBMISSIONS_SCREEN = 'hekla.UserSubmissionsScreen';
export const USER_COMMENTS_SCREEN = 'hekla.UserCommentsScreen';
export const USER_FAVORITES_SCREEN = 'hekla.UserFavoritesScreen';
export const IPAD_SCREEN = 'hekla.IPadScreen';

export const Screens = new Map();
Screens.set(STORIES_SCREEN, Stories);
Screens.set(STORY_SCREEN, Story);
Screens.set(SEARCH_SCREEN, Search);
Screens.set(RESULT_SCREEN, Result);
Screens.set(ACCOUNT_SCREEN, Account);
Screens.set(ACCOUNT_HIDDEN_SCREEN, AccountHidden);
Screens.set(ACCOUNT_VOTED_SCREEN, AccountVoted);
Screens.set(REPLY_SCREEN, Reply);
Screens.set(SETTINGS_SCREEN, Settings);
Screens.set(SETTINGS_GENERAL_SCREEN, SettingsGeneral);
Screens.set(SETTINGS_APPEARANCE_SCREEN, SettingsAppearance);
Screens.set(SETTINGS_THEME_SCREEN, SettingsThemeScreen);
Screens.set(SETTINGS_ABOUT_SCREEN, SettingsAbout);
Screens.set(SETTINGS_DONATE_SCREEN, SettingsDonate);
Screens.set(USER_SCREEN, User);
Screens.set(USER_SUBMISSIONS_SCREEN, UserSubmissions);
Screens.set(USER_COMMENTS_SCREEN, UserComments);
Screens.set(USER_FAVORITES_SCREEN, UserFavorites);
Screens.set(IPAD_SCREEN, IPad);

export const startApp = () => {
  StatusBar.setBarStyle('dark-content', true);
  const isSplitView = UI.isIpad && UI.settings.appearance.iPadSidebarEnabled;

  const iconColor = getVar('--tabbar-fg');
  const textColor = getVar('--tabbar-fg');
  const selectedIconColor = getVar('--tabbar-tint');
  const selectedTextColor = getVar('--tabbar-tint');

  const tabs = [
    {
      stack: {
        id: 'STORY_SCREEN',
        children: isSplitView ? [{
          component: {
            name: IPAD_SCREEN,
          },
        }] : [{
          component: {
            name: STORIES_SCREEN,
          },
        }],
        options: {
          bottomTab: {
            iconColor,
            textColor,
            selectedIconColor,
            selectedTextColor,
            text: 'Stories',
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
            iconColor,
            textColor,
            selectedIconColor,
            selectedTextColor,
            text: 'Account',
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
            iconColor,
            textColor,
            selectedIconColor,
            selectedTextColor,
            text: 'Search',
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
            iconColor,
            textColor,
            selectedIconColor,
            selectedTextColor,
            text: 'Settings',
            testID: 'SETTINGS_TAB',
            icon: require('assets/icons/25/settings.png'),
          },
        },
      },
    },
  ];

  if (isSplitView) {
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
              children: tabs,
            },
          },
          options: {
            displayMode: 'visible',
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

export const storyScreen = async (props: StoryScreenProps) => {
  const isSplitView = UI.isIpad && UI.settings.appearance.iPadSidebarEnabled;
  const { id, descendants = 0, isMasterView = false, reactTag } = props;

  const opts = {
    component: {
      name: STORY_SCREEN,
      passProps: {
        id: String(id),
      },
      options: {
        topBar: {
          title: {
            text: prettyNumber(descendants, 'Comments'),
          },
        },
        preview: reactTag ? {
          reactTag,
          commit: true,
        } : undefined,
      },
    },
  } as any;

  if (isSplitView && isMasterView) {
    // Pop to root
    await Navigation.popToRoot(UI.iPadDetailComponentId);
    // Switch to first tab
    await Navigation.mergeOptions(UI.iPadDetailComponentId, { bottomTabs: { currentTabIndex: 0 } });
    return when(
      // Wait for detail view to appear
      () => UI.componentId === UI.iPadDetailComponentId,
      // Then push new controller
      () => Navigation.push(UI.iPadDetailComponentId, opts),
    );
  }

  return Navigation.push(UI.componentId, opts);
};
