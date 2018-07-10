import { types } from 'mobx-state-tree';

export const themes = {
  light: 'Light',
  dark: 'Dark',
};

export default types.enumeration('Theme', Object.keys(themes));
