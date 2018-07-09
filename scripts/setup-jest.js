import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({
  adapter: new Adapter(),
});

jest.mock('react-native-firebase', () => ({
  database() {},
  firestore() {},
}));

jest.mock('react-native-cookies', () => ({
  get() {},
  set() {},
  clearAll() {},
}));

jest.mock('react-native-custom-tabs', () => 'ReactNativeCustomTabs');
jest.mock('react-native-config', () => 'ReactNativeConfig');
