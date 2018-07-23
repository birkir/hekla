import { Platform, StyleSheet, StatusBar } from 'react-native';
import set from 'lodash/set';
import UI from 'stores/UI';
import themes from './themes';

export const getVar = (name: string, fallback: string = undefined) => {
  return themes[UI.settings.appearance.theme][name] || fallback;
};

const getStatusBarStyle = (backgroundColor) => {
  const result = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i.exec(backgroundColor);
  if (!result) return 'light-content';
  const [r, g, b] = result.slice(1, 4).map(n => parseInt(n.length === 1 ? `f${n}` : n, 16));
  const shade = (r + g + b) / 3;
  return shade > 128 ? 'dark-content' : 'light-content';
};

export const applyThemeOptions = (settings: any) => {
  if (Platform.OS === 'ios') {

    // NavBar
    const navBarStyle = getVar('--navbar-style', 'light');
    const navBarBg = getVar('--navbar-bg', 'transparent');

    if (navBarBg && navBarBg !== 'transparent') {
      StatusBar.setBarStyle(getStatusBarStyle(navBarBg));
    } else {
      StatusBar.setBarStyle(navBarStyle === 'dark' ? 'light-content' : 'dark-content');
    }

    // NavBar
    const tabBarStyle = getVar('--tabbar-style', 'light');
    const tabBarBg = getVar('--tabbar-bg', 'transparent');

    // Top Bar
    set(settings, 'topBar.background.color', navBarBg);
    set(settings, 'topBar.drawBehind', true);
    set(settings, 'topBar.translucent', navBarStyle === 'dark' || navBarStyle === 'light');
    set(settings, 'topBar.barStyle', navBarStyle === 'dark' ? 'black' : 'default');
    set(settings, 'topBar.title.color', getVar('--navbar-fg'));
    set(settings, 'topBar.buttonColor', getVar('--navbar-tint'));

    // Bottom Tabs
    set(settings, 'bottomTabs.backgroundColor', tabBarBg);
    set(settings, 'bottomTabs.translucent', tabBarStyle === 'dark' || tabBarStyle === 'light');
    set(settings, 'bottomTabs.barStyle', tabBarStyle === 'dark' ? 'black' : 'default');
    set(settings, 'bottomTabs.drawBehind', true);
    set(settings, 'bottomTabs.selectedTabColor', getVar('--tabbar-tint'));

    if (settings.bottomTab) {
      set(settings, 'bottomTab.iconColor', getVar('--tabbar-fg'));
      set(settings, 'bottomTab.textColor', getVar('--tabbar-fg'));
      set(settings, 'bottomTab.selectedTextColor', getVar('--tabbar-tint'));
      set(settings, 'bottomTab.selectedIconColor', getVar('--tabbar-tint'));
    }

    set(settings, 'layout.backgroundColor', getVar('--backdrop'));
  }

  if (Platform.OS === 'android') {
    set(settings, 'statusBar.backgroundColor', getVar('--statusbar-bg'));

    // NavBar    // NavBar
    const navBarStyle = getVar('--navbar-style', 'light');
    const navBarBg = getVar('--navbar-bg', 'transparent');

    const tabBarStyle = getVar('--tabbar-style', 'light');
    const tabBarBg = getVar('--tabbar-bg', 'transparent');

    // Top Bar
    set(settings, 'topBar.background.color', getVar('--tint-bg'));
    set(settings, 'topBar.title.color', getVar('--tint-fg'));
    set(settings, 'topBar.buttonColor', getVar('--tint-fg'));
    set(settings, 'topBar.backButton.color', getVar('--tint-fg'));

    // Bottom tabs
    if (!tabBarBg || tabBarBg === 'transparent') {
      set(settings, 'bottomTabs.backgroundColor', getVar('--backdrop'));
    } else {
      set(settings, 'bottomTabs.backgroundColor', getVar('--tabbar-bg'));
    }

    set(settings, 'bottomTabs.selectedTabColor', getVar('--tabbar-tint'));
    set(settings, 'bottomTabs.titleDisplayMode', 'alwaysShow');

    if (settings.bottomTab) {
      set(settings, 'bottomTab.iconColor', getVar('--tabbar-fg'));
      set(settings, 'bottomTab.textColor', getVar('--tabbar-fg'));
      set(settings, 'bottomTab.selectedTextColor', getVar('--tabbar-tint'));
      set(settings, 'bottomTab.selectedIconColor', getVar('--tabbar-tint'));
    }

    if (!settings.layout || (settings.layout && !settings.layout.backgroundColor)) {
      set(settings, 'layout.backgroundColor', getVar('--content-bg'));
    }

    if (settings.topBar.rightButtons) {
      set(settings, 'topBar.rightButtons', settings.topBar.rightButtons.map(button => ({
        ...button,
        color: getVar('--tint-fg'),
      })));
    }
  }

  return settings;
};

export function theme(styles) {

  const cache = {};

  for (const key in styles) {
    cache[key] = {};
    for (const name in styles[key]) {
      const value = styles[key][name];
      cache[key][name] = value;
      if (typeof value === 'string') {
        const matchVar = value.match(/var\((.*?)\)/);
        if (matchVar) {
          const varName = matchVar[1].trim();
          for (const theme in themes) {
            if (themes[theme][varName]) {
              const themeKey = `${key}__theme-${theme}`;
              const themeValue = themes[theme][varName];
              cache[themeKey] = cache[themeKey] || {};
              cache[themeKey][name] = themeValue;
            }
          }

          if (themes.default[varName]) {
            cache[key] = cache[key] || {};
            cache[key][name] = themes.default[varName];
          } else {
            delete cache[key][name];
          }
        }
      }
    }
  }

  const sheet = StyleSheet.create(cache);

  function themeSelector(...args) {
    const classes = [];

    for (let i = 0; i < args.length; i += 1) {
      const arg = args[i];
      if (!arg) continue;

      const argType = typeof arg;

      if (argType === 'string' && sheet[arg]) {
        classes.push(sheet[arg]);
        if (sheet[`${arg}__theme-${UI.settings.appearance.theme}`]) {
          classes.push(sheet[`${arg}__theme-${UI.settings.appearance.theme}`]);
        }
      } else if (argType === 'number') {
        classes.push(arg);
      } else if (Array.isArray(arg) && arg.length) {
        const inner = themeSelector.apply(null, arg);
        if (inner) {
          classes.push(inner);
        }
      } else if (argType === 'object') {
        for (const key in arg) {
          if ({}.hasOwnProperty.call(arg, key) && arg[key] && sheet[key]) {
            classes.push(sheet[key]);
            if (sheet[`${key}__theme-${UI.settings.appearance.theme}`]) {
              classes.push(sheet[`${key}__theme-${UI.settings.appearance.theme}`]);
            }
          }
        }
      }
    }

    return classes;
  }

  for (const key in sheet) {
    themeSelector[key] = sheet[key];
    Object.defineProperty(themeSelector, key, {
      get() {
        return [sheet[key], sheet[`${key}__theme-${UI.settings.appearance.theme}`]];
      },
    });
  }

  return themeSelector as any;
}

Object.defineProperty(theme, 'variables', {
  get() {
    return themes[UI.settings.appearance.theme];
  },
});
