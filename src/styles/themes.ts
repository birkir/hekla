import kebabCase from 'lodash/kebabCase';
import mapKeys from 'lodash/mapKeys';
import { Platform, StyleSheet } from 'react-native';
const themes = require('./themes.styl');

for (const name in themes) {
  themes[name] = mapKeys(themes[name], (value, key) => `--${kebabCase(key)}`);
  // Loop keys and replace platform if available
  for (const key in themes[name]) {
    if (themes[name][`${key}-${Platform.OS}`]) {
      themes[name][key] = themes[name][`${key}-${Platform.OS}`];
    }
  }
}

// Import some calculated units and variables
themes.default['--hairline-width'] = StyleSheet.hairlineWidth;

export default themes;
