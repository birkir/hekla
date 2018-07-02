import kebabCase from 'lodash/kebabCase';
import mapKeys from 'lodash/mapKeys';
import { StyleSheet } from 'react-native';
const themes = require('./themes.styl');

for (const name in themes) {
  themes[name] = mapKeys(themes[name], (value, key) => `--${kebabCase(key)}`);
}

// Import some calculated units and variables
themes.default['--hairline-width'] = StyleSheet.hairlineWidth;

export default themes;
