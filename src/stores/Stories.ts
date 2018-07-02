import { types, flow, applySnapshot, getSnapshot } from 'mobx-state-tree';
import values from 'lodash/values';
import compact from 'lodash/compact';
import { db, fetchRef } from 'utils/firebase';
import { ItemReference } from './models/Item';
import StoriesType from './models/StoriesType';
import Items from './Items';

const IDLE = 0;
const INITIAL = 1;

const Stories = types
  .model('Stories', {
    type: types.optional(StoriesType, 'topstories'),
    isLoading: types.optional(types.boolean, false),
    stories: types.optional(types.array(ItemReference), []),
  })
  .views(self => ({
    pretty(type) {

      if (type === 'askstories') {
        return 'Ask HN';
      }
      if (type === 'showstories') {
        return 'Show HN';
      }
      if (type === 'jobstories') {
        return 'Jobs';
      }

      const justType = type.replace(/stories/, '');
      return `${justType.substr(0, 1).toUpperCase()}${justType.substr(1)} Stories`;
    },

    get prettyType() {
      return (self as any).pretty(self.type);
    },
  }))
  .actions((self) => {

    const uniqById = (id: string) => !self.stories.find((s: any) => s.id === id);

    /**
     * Fetch stories by props set to Stories
     * @param {boolean} more Fetch more?
     * @param {boolean} reload Should refresh all the stuff
     */
    const fetchStories = flow(function* (offset = 0, limit = 50) {

      self.isLoading = true;

      const ref = db.ref(`v0/${self.type}`)
        .orderByKey()
        .startAt(String(offset))
        .limitToFirst(limit);

      // Get story ids from Firebase
      const res = yield fetchRef(ref, 550);

      // Convert into an array of item id's as strings
      const storyIds = compact(values(res)).map(String);

      // Resolve all items
      yield Promise.all(storyIds.map((id: string, index: number) => {
        // Fetch metadata for first two items in each reload.
        const metadata = index < 2 && offset === 0;
        return (Items as any).fetchItem(id, { metadata });
      }));

      // Push items into stories array
      self.stories.push(...storyIds.filter(uniqById));

      self.isLoading = false;
    }) as (offset?: number, limit?: number) => any;

    return {
      fetchStories,
      setType(type) {
        const isChanged = type !== self.type;
        self.type = type;
        return isChanged;
      },
      clear() {
        self.stories.clear();
      },
    };
  })
  .create();

export default Stories;

if (module.hot) {
  if (module.hot.data && module.hot.data.store) {
    applySnapshot(Stories, module.hot.data.store);
    // Refetch stories
    Stories.fetchStories();
  }

  module.hot.dispose((data = {}) => {
    // Clear stories before hot reload so we dont have to
    // deal with lost Item references.
    Stories.clear();

    module.hot.data = {
      store: getSnapshot(Stories),
    };
  });
}
