import { Platform } from 'react-native';
import { types } from 'mobx-state-tree';

export const DefaultBrowserValues = {} as any;

if (Platform.OS === 'android') {
  DefaultBrowserValues.inApp = 'In-App Chrome';
  DefaultBrowserValues.chrome = 'Chrome';
}

if (Platform.OS === 'ios') {
  DefaultBrowserValues.inApp = 'In-App Safari';
  DefaultBrowserValues.safari = 'Safari';
  DefaultBrowserValues.chrome = 'Chrome';
}

export const formatDefaultBrowser = key => DefaultBrowserValues[key];

export default types.enumeration('DefaultBrowser', Object.keys(DefaultBrowserValues));
