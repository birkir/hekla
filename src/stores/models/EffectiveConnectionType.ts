import { types } from 'mobx-state-tree';

const EffectiveConnectionType = types.enumeration('EffectiveConnectionType', [
  '2g',
  '3g',
  '4g',
  'unknown',
]);

export default EffectiveConnectionType;
