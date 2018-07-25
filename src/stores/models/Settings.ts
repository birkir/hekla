import { types } from 'mobx-state-tree';
import set from 'lodash/set';
import config from 'config';
import StoriesType, { formatStoriesType } from '../enums/StoriesType';
import Theme from '../enums/Theme';
import StorySize from '../enums/StorySize';
import DefaultBrowser from '../enums/DefaultBrowser';
import CompactThumbnail from '../enums/CompactThumbnail';
import CompactVoteButton from '../enums/CompactVoteButton';
import Font from '../enums/Font';

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
      return formatStoriesType(self.defaultStoriesToLoad);
    },
  }));

const Appearance = types
  .model({
    useSystemFontSize: types.optional(types.boolean, true),
    fontSize: types.optional(types.number, 3),
    fontFamilyBody: types.optional(Font, 'System'),
    theme: types.optional(Theme, 'light'),
    storySize: types.optional(StorySize, 'large'),
    showPageEndings: types.optional(types.boolean, false),
    largeShowThumbnail: types.optional(types.boolean, true),
    largeShowVoteButton: types.optional(types.boolean, true),
    largeShowDownloadButton: types.optional(types.boolean, false),
    compactThumbnail: types.optional(CompactThumbnail, 'left'),
    compactVoteButton: types.optional(CompactVoteButton, 'left'),
    commentsUseColorScheme: types.optional(types.boolean, true),
    commentsShowMetaLinks: types.optional(types.boolean, true),
    iPadSidebarEnabled: types.optional(types.boolean, true),
  });

const Settings = types
  .model('Settings', {
    general: types.optional(General, {}),
    appearance: types.optional(Appearance, {}),
    isFirstRun: types.optional(types.boolean, true),
    isBeta: types.optional(types.boolean, config.isTestFlight || false),
  })
  .actions(self => ({
    // Bad idea in a typed environment but I am lazy.
    setValue(key, value) {
      set(self, key, value);
    },
  }));

export default Settings;
