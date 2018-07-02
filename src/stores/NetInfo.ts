import { types } from 'mobx-state-tree';
import { NetInfo as RNNetInfo } from 'react-native';
import ConnectionType from './models/ConnectionType';
import EffectiveConnectionType from './models/EffectiveConnectionType';

const NetInfo = types
  .model({
    type: types.optional(ConnectionType, 'unknown'),
    effectiveType: types.optional(EffectiveConnectionType, 'unknown'),
  })
  .views(self => ({
    get isOffline() {
      if (self.type === 'none' || self.type === 'unknown') {
        if (self.effectiveType === 'unknown') {
          return true;
        }
      }

      return false;
    },
  }))
  .actions(self => ({
    update({ type, effectiveType }) {
      if (type) {
        self.type = type;
      }
      if (effectiveType) {
        self.effectiveType = effectiveType;
      }
    },
  }))
  .create();

RNNetInfo.getConnectionInfo().then(NetInfo.update);
RNNetInfo.addEventListener('connectionChange', NetInfo.update);

export default NetInfo;
