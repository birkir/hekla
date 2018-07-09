import { types } from 'mobx-state-tree';
import StoriesType, { formatStoryType } from './StoriesType';
import Theme from './Theme';
import set from 'lodash/set';
import config from 'config';
import DefaultBrowser from './DefaultBrowser';

const General = types
  .model({
    defaultStoriesToLoad: types.optional(StoriesType, 'topstories'),
    markReadOn3dTouch: types.optional(types.boolean, false),
    hideBarsOnScroll: types.optional(types.boolean, false),
    commentTapToCollapse: types.optional(types.boolean, true),
    commentSwipeActions: types.optional(types.boolean, true),
    browserUseReaderMode: types.optional(types.boolean, false),
    browserOpenIn: types.optional(DefaultBrowser, 'inApp'),
  })
  .views(self => ({
    get defaultStoriesToLoadValue() {
      return formatStoryType(self.defaultStoriesToLoad);
    },
  }));

const Appearance = types
  .model({
    useSystemFontSize: types.optional(types.boolean, true),
    fontSize: types.optional(types.number, 4),
    theme: types.optional(Theme, 'light'),
    storySize: types.optional(types.enumeration('StorySize', ['large', 'compact']), 'large'),
    showPageEndings: types.optional(types.boolean, false),
  })
  .views(self => ({
    storySizeValue(id = self.storySize) {
      return self.storySize;
    },
    get isDarkTheme() {
      if (self.theme === 'dark') {
        return true;
      }

      return false;
    },
  }));

const Settings = types
  .model('Settings', {
    general: types.optional(General, {}),
    appearance: types.optional(Appearance, {}),
    isBeta: types.optional(types.boolean, config.isTestFlight || false),
  })
  .actions(self => ({
    // Bad idea in a typed environment but I am lazy.
    setValue(key, value) {
      set(self, key, value);
    },
  }));

export default Settings;
