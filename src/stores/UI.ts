import { types, flow, applySnapshot } from 'mobx-state-tree';
import { Dimensions, Platform, PlatformIOSStatic, NativeModules, AsyncStorage, Linking } from 'react-native';
import { CustomTabs } from 'react-native-custom-tabs';
import CodePush from 'react-native-code-push';
import Settings from './models/Settings';
import prettyNumber from 'utils/prettyNumber';
import Stories from './Stories';
import { IPAD_SCREEN, STORIES_SCREEN } from 'screens';

const { width, height } = Dimensions.get('window');

const UI = types
  .model('UI', {
    componentId: types.maybe(types.string),
    iPadMasterComponentId: types.maybe(types.string),
    iPadDetailComponentId: types.maybe(types.string),
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
    font(size: number, heading: boolean = false) {
      return {
        fontFamily: heading ? self.settings.appearance.fontFamilyHeading : self.settings.appearance.fontFamilyBody,
        fontSize: UI.settings.appearance.useSystemFontSize ? size : size + self.settings.appearance.fontSize - 3,
      };
    },
  }))
  .actions(self => ({

    setComponentId(componentId: string, componentName?: string) {

      // STORIES_SCREEN = master
      if (componentName === STORIES_SCREEN) {
        self.iPadMasterComponentId = componentId;

        if (self.isIpad && self.settings.appearance.iPadSidebarEnabled) {
          return;
        }
      }

      // IPAD_SCREEN = detail
      if (componentName === IPAD_SCREEN) {
        self.iPadDetailComponentId = componentId;
      }

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

    openURL(url: string, reactTag: number = -1) {
      const { browserOpenIn, browserUseReaderMode } = UI.settings.general;
      if (Platform.OS === 'ios') {
        if (browserOpenIn === 'inApp') {
          return NativeModules.RNHekla.openSafari(
            self.componentId,
            url,
            browserUseReaderMode,
            reactTag,
          );
        }

        if (browserOpenIn === 'chrome') {
          return CustomTabs.openURL(url);
        }

        return Linking.openURL(url)
          .then(() => null)
          .catch(() => null);
      }
      if (Platform.OS === 'android' && reactTag === -1) {
        CustomTabs.openURL(url, {
          toolbarColor: '#607D8B',
          enableUrlBarHiding: true,
          showPageTitle: true,
          enableDefaultShare: true,
        });
      }
    },

    restartApp() {
      return CodePush.restartApp(false);
    },

    // Apply current settings to all their counter-parts
    apply() {
      Stories.setType(UI.settings.general.defaultStoriesToLoad);
    },

    hydrate() {
      return flow(function* () {
        try {
          const data = yield AsyncStorage.getItem('UI.settings');
          if (data) {
            applySnapshot(UI.settings, JSON.parse(data));
          }
          (self as any).apply();
        } catch (err) {}
        return;
      })();
    },
  }))
  .create();

export default UI;
