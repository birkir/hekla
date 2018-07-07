import { flow, types } from 'mobx-state-tree';
import { db } from 'utils/firebase';
import fetchMetadata, { fetchMetadataCache } from 'utils/fetchMetadata';
import Item from './models/Item';

const Items = types
  .model('Items', {
    items: types.map(types.late(() => Item)),
  })
  .actions((self) => {
    return {
      /**
       * Fetch item by id (from cache or network)
       * @param {string} id Hackernews item id
       * @param {number} index Index of item in list
       * @return {Promise}
       */
      fetchItem(id: string, { metadata = false } = {}) {
        return flow(function* () {
          const key = String(id);

          if (!self.items.has(key)) {

            const ref = db.ref(`v0/item/${id}`);
            ref.keepSynced(true);

          // Get story ids from Firebase
          const data = yield new Promise((resolve) => {
            ref.once('value').then(s => resolve(s.val()));
            setTimeout(() => ref.off('value') && resolve({}), 1500);
          });

            data.id = key;

            if (!data) {
              // TODO: Make sure to cache deleted items so we don't need to fetch
              //       every time.
              return null;
            }

            const item = Item.create(data);

            if (!metadata) {
              item.setMetadata(yield fetchMetadataCache(data.url));
            } else {
              item.setMetadata(yield fetchMetadata(data.url));
            }

            // There can be cases where the item is being fetched twice in parallel.
            // Helps race conditions in components.
            if (!self.items.has(key)) {
              self.items.put(item);
            }
          }

          return self.items.get(key);
        })();
      },
    };
  })
  .create({
    items: {},
  });

export default Items;
