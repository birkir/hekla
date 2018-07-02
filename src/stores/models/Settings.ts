import { types } from 'mobx-state-tree';
import StoriesType from './StoriesType';
import Theme from './Theme';

const General = types
  .model({
    defaultStoriesToLoad: types.optional(StoriesType, 'topstories'),
    markReadOn3dTouch: types.optional(types.boolean, false),
  });

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
  }))
  .actions(self => ({
    setUseSystemFontSize(flag: boolean) {
      self.useSystemFontSize = flag;
    },
    setFontSize(size: number) {
      self.fontSize = size;
    },
    setTheme(theme: typeof self.theme) {
      self.theme = theme;
    },
    setStorySize(size: typeof self.storySize) {
      self.storySize = size;
    },
    setShowPageEndings(flag: boolean) {
      self.showPageEndings = flag;
    },
  }));

const Settings = types
  .model('Settings', {
    general: types.optional(General, {}),
    appearance: types.optional(Appearance, {}),
  });

export default Settings;
