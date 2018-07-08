import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({
  adapter: new Adapter(),
});

jest.mock('react-native-firebase', () => ({
  database() {},
}));

jest.mock('react-native-cookies', () => ({
  get() {},
  set() {},
  clearAll() {},
}))
