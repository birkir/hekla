import { types } from 'mobx-state-tree';

export const themes = {
  light: 'Default (light)',
  dark: 'Default (dark)',
  solarizedLight: 'Solarized Light',
  solarizedDark: 'Solarized Dark',
};

export default types.enumeration('Theme', Object.keys(themes));
