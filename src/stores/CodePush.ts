import { types } from 'mobx-state-tree';
import CodePush from 'react-native-code-push';
import UpdateMetadata from './models/UpdateMetadata';

export default types
  .model('CodePush', {
    updateMetadata: UpdateMetadata,
  })
  .views(self => ({
    get version() {
      const { appVersion, label } = self.updateMetadata;

      if (!appVersion) {
        return 'Unknown';
      }

      return `${appVersion || '0.0'}-${label || 'v?'}`;
    },
  }))
  .actions(self => ({
    async update() {
      self.updateMetadata = await CodePush.getUpdateMetadata();
    },
  }))
  .create();
