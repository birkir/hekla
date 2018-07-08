import { types, flow, applySnapshot } from 'mobx-state-tree';
import { Dimensions, Platform, PlatformIOSStatic, NativeModules, AsyncStorage } from 'react-native';
import Settings from './models/Settings';
import prettyNumber from 'utils/prettyNumber';
import Stories from './Stories';

const { width, height } = Dimensions.get('window');

const UI = types
  .model('UI', {
    componentId: types.maybe(types.string),
    settings: types.optional(Settings, {}),
    width: types.optional(types.number, width),
    height: types.optional(types.number, height),
    isIpad: Platform.OS === 'ios' && (Platform as PlatformIOSStatic).isPad,
    isConnected: types.optional(types.boolean, false),
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

    setIsConnected(connected) {
      self.isConnected = connected;
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

    // Apply current settings to all their counter-parts
    apply() {
      Stories.setType(UI.settings.general.defaultStoriesToLoad);
    },

    hydrate() {
      return flow(function* () {
        try {
          const data = yield AsyncStorage.getItem('UI.settings');
          const state = JSON.parse(data);
          applySnapshot(UI.settings, state);
          (self as any).apply();
        } catch (err) {}
        return;
      })();
    },
  }))
  .create();

export default UI;
