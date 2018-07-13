import { Platform } from 'react-native';
import { types } from 'mobx-state-tree';

export const font = {
  System: 'System Default',
} as any;

if (Platform.OS === 'android') {
  font['Roboto'] = 'Roboto';
}

if (Platform.OS === 'ios') {
  font['American Typewriter'] = 'American Typewriter';
  font['Avenir Next'] = 'Avenir Next';
  font['Georgia'] = 'Georgia';
  font['Iowan Old Style'] = 'Iowan';
  font['Palatino'] = 'Palatino';
  font['Times New Roman'] = 'Times New Roman';
}

export const formatFont = (key: string) => {
  return font[key];
};

export default types.enumeration('Font', Object.keys(font));
