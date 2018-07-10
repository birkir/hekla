import { Platform, StyleSheet, StatusBar } from 'react-native';
import set from 'lodash/set';
import UI from 'stores/UI';
import themes from 'styles/themes';

export const getVar = (name: string, fallback: string = undefined) => {
  return themes[UI.settings.appearance.theme][name] || fallback;
};

export const applyThemeOptions = (settings: any) => {
  const { theme, isDarkTheme } = UI.settings.appearance;

  if (Platform.OS === 'ios') {
    set(settings, 'topBar.drawBehind', true);
    set(settings, 'topBar.translucent', true);
    set(settings, 'bottomTabs.drawBehind', true);
    set(settings, 'bottomTabs.translucent', true);

    set(settings, 'layout.backgroundColor', getVar('--backdrop-color'));

    if (isDarkTheme) {
      StatusBar.setBarStyle('light-content');

      set(settings, 'topBar.barStyle', 'black');
      set(settings, 'topBar.noBorder', true);
      set(settings, 'bottomTabs.barStyle', 'black');

      if (settings.bottomTab) {
        set(settings, 'bottomTab.iconColor', '#808080');
        set(settings, 'bottomTab.textColor', '#808080');
      }

    } else {
      StatusBar.setBarStyle('dark-content');

      set(settings, 'topBar.barStyle', 'default');
      set(settings, 'topBar.noBorder', false);
      set(settings, 'bottomTabs.barStyle', 'default');

      if (settings.bottomTab) {
        set(settings, 'bottomTab.iconColor', '#808080');
        set(settings, 'bottomTab.textColor', '#808080');
      }
    }

    if (settings.bottomTab) {
      set(settings, 'bottomTab.selectedTextColor', getVar('--primary-color'));
      set(settings, 'bottomTab.selectedIconColor', getVar('--primary-color'));
    }

    set(settings, 'topBar.buttonColor', getVar('--primary-color'));
    set(settings, 'bottomTabs.selectedTabColor', getVar('--primary-color'));
  }

  if (Platform.OS === 'android') {
    set(settings, 'bottomTabs.titleDisplayMode', 'alwaysShow');
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
