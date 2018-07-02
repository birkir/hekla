import { types, flow, onSnapshot, applySnapshot } from 'mobx-state-tree';
import { Dimensions, Platform, PlatformIOSStatic, NativeModules, AsyncStorage } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Settings from './models/Settings';
import prettyNumber from 'utils/prettyNumber';

const { width, height } = Dimensions.get('window');

const UI = types
  .model('UI', {
    componentId: types.maybe(types.string),
    settings: types.optional(Settings, {}),
    width: types.optional(types.number, width),
    height: types.optional(types.number, height),
    isIpad: Platform.OS === 'ios' && (Platform as PlatformIOSStatic).isPad,
    preview: types.optional(
      types.model('Preview', {
        srcComponentId: types.maybe(types.string),
        dstComponentId: types.maybe(types.string),
        active: types.optional(types.boolean, false),
      }),
      {},
    ),
    cacheSizeInBytes: types.optional(types.number, 0),
  })
  .views(self => ({
    get scrollEnabled() {
      return !self.preview.active;
    },
    get cacheSize() {
      if (self.cacheSizeInBytes === 0) {
        return '(empty)';
      }
      return `${prettyNumber(self.cacheSizeInBytes, '', 1024)}b`;
    },
  }))
  .actions(self => ({
    setComponentId(componentId: string) {
      self.componentId = componentId;
    },
    setPreview(preview) {
      self.preview = preview;
    },
    async clearCache() {
      try {
        await AsyncStorage.clear();
      } catch (err) {}
      (self as any).updateCache();
    },
    updateCache() {
      return flow(function* () {
        try {
          const keys = yield AsyncStorage.getAllKeys();
          const raw = yield AsyncStorage.multiGet(keys);
          self.cacheSizeInBytes = raw.reduce((a, b) => a + b[0].length + b[1].length, 0);
        } catch (err) {}
      })();
    },
    updateWindow() {
      const { width, height } = Dimensions.get('window');
      self.width = width;
      self.height = height;
    },
    openURL(url: string, elementId?: string) {
      return NativeModules.RNUeno.openSafari(
        self.componentId,
        url,
        elementId,
      );
    },
    hydrate() {
      return flow(function* () {
        try {
          const data = yield AsyncStorage.getItem('UI.settings');
          const state = JSON.parse(data);
          applySnapshot(UI.settings, state);
        } catch (err) {}
        return;
      })();
    },
  }))
  .create();

Navigation.events().registerNativeEventListener((name, params) => {
  if (name === 'previewContext') {
    UI.setPreview({
      srcComponentId: params.componentId,
      dstComponentId: params.previewComponentId,
      active: true,
    });
  }

  if (name === 'previewCommit') {
    UI.setPreview({
      active: false,
    });
  }
});

Navigation.events().registerComponentDidAppearListener((componentId, componentName) => {
  UI.setComponentId(componentId);
});

Navigation.events().registerComponentDidDisappearListener((componentId, componentName) => {
  if (UI.preview.dstComponentId === componentId) {
    UI.setComponentId(UI.preview.srcComponentId);
    UI.setPreview({
      active: false,
    });
  }
});

// Persist Settings!
onSnapshot(UI.settings, (snapshot) => {
  AsyncStorage.setItem('UI.settings', JSON.stringify(snapshot));
});

export default UI;
