import { types } from 'mobx-state-tree';

const ConnectionType = types.enumeration('ConnectionType', [
  'none',
  'wifi',
  'cellular',
  'bluetooth', // Android
  'ethernet', // Android
  'wimax', // Android
  'unknown',
]);

export default ConnectionType;
