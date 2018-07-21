import { types, flow, applySnapshot, getSnapshot } from 'mobx-state-tree';
import values from 'lodash/values';
import compact from 'lodash/compact';
import { db } from 'utils/firebase';
import Item, { ItemReference } from './models/Item';
import StoriesType, { formatStoriesType } from './enums/StoriesType';
import Items from './Items';

const MAX_TIMEOUT = 3000;

const Stories = types
  .model('Stories', {
    type: types.optional(StoriesType, 'topstories'),
    isLoading: types.optional(types.boolean, false),
    stories: types.optional(types.array(ItemReference), []),
  })
  .views(self => ({
    get prettyType() {
      return formatStoriesType(self.type);
    },
  }))
  .actions((self) => {

    // Keep ref available for disposal
    let ref;

    const uniqById = (id: string) => !self.stories.find((s: any) => !!s && s.id === id);

    return {
      /**
       * Fetch stories by props set to Stories
       * @param {boolean} more Fetch more?
       * @param {boolean} reload Should refresh all the stuff
       */
      fetchStories(offset: number = 0, limit: number = 25) {
        return flow(function* () {
          const start = new Date().getTime();

          self.isLoading = true;

          ref = db.ref(`v0/${self.type}`)
            .orderByKey()
            .startAt(String(offset))
            .limitToFirst(limit);

          // Always fetch latest
          ref.keepSynced(true);

          // Get story ids from Firebase
          const res = yield new Promise((resolve) => {
            ref.once('value').then(s => resolve(s.val()));
            setTimeout(() => ref.off('value') && resolve({}), MAX_TIMEOUT);
          });

          // Convert into an array of item id's as strings
          const storyIds = compact(values(res)).map(String);

          // Resolve all items
          yield Promise.all(storyIds.map((id: string, index: number) => {
            // Fetch metadata for first two items in each reload.
            const metadata = index < 2 && offset === 0;
            return Items.fetchItem(id, { metadata });
          }));

          // Wait at least 990ms for new data to make loading
          // indicators non janky.
          const delay = 990 - (new Date().getTime() - start);
          if (delay > 0) {
            yield new Promise(r => setTimeout(r, delay));
          }

          // Push items into stories array
          self.stories.push(...storyIds.filter(uniqById));
          self.stories.push(Item.create({
            id: `PAGE_${offset}_${limit}`,
            type: 'page',
            time: offset / limit,
          }));

          self.isLoading = false;

        })();
      },
      setType(type) {
        const isChanged = type !== self.type;
        self.type = type;
        return isChanged;
      },
      dispose() {
        if (ref) {
          ref.off('value');
        }
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
    Stories.dispose();
    Stories.clear();

    module.hot.data = {
      store: getSnapshot(Stories),
    };
  });
}
