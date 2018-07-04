import { types, flow } from 'mobx-state-tree';
import CodePush from 'react-native-code-push';
import UpdateMetadata from './models/UpdateMetadata';

export default types
  .model('CodePush', {
    updateMetadata: types.maybe(UpdateMetadata),
  })
  .views(self => ({
    get version() {
      const { appVersion = undefined, label = 'v?' } = self.updateMetadata || {};

      if (!appVersion) {
        return 'Unknown';
      }

      return `${appVersion}-${label}`;
    },
  }))
  .actions(self => ({
    update() {
      return flow(function* () {
        self.updateMetadata = yield CodePush.getUpdateMetadata();
        console.log(self.updateMetadata);
      })();
    },
  }))
  .create();
