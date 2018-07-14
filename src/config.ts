import { NativeModules } from 'react-native';
import config from 'react-native-config';
import configEnvJs from './config.env.js'; // Generated module

// Combine native config and generated JS config
export default {
  ...config,
  ...configEnvJs,
  ...NativeModules.RNHekla,
  __native: config,
  __js: configEnvJs,
};
