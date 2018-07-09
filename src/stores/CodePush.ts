import { types, flow } from 'mobx-state-tree';
import CodePush from 'react-native-code-push';
import UpdateMetadata from './models/UpdateMetadata';

const CodePushStore = types
  .model('CodePush', {
    updateMetadata: types.maybe(UpdateMetadata),
  })
  .views(self => ({
    get description() {
      const { description = null } = self.updateMetadata || {};
      return description;
    },
    get version() {
      const { label = null } = self.updateMetadata || {};
      return label;
    },
  }))
  .actions(self => ({
    update() {
      return flow(function* () {
        self.updateMetadata = yield CodePush.getUpdateMetadata();
      })();
    },
  }))
  .create();

// Update CodePush
CodePushStore.update();

export default CodePushStore;
