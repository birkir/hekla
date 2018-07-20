import { types } from 'mobx-state-tree';

export const themes = {
  light: 'Default (light)',
  dark: 'Default (dark)',
  piggy: 'Piggy (dark)',
  piggyLight: 'Piggy (light)',
  glowfish: 'Glowfish',
};

export default types.enumeration('Theme', Object.keys(themes));
