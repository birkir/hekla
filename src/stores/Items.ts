import { flow, types } from 'mobx-state-tree';
import { db, fetchRef } from 'utils/firebase';
import fetchMetadata, { fetchMetadataCache } from 'utils/fetchMetadata';
import Item from './models/Item';

const Items = types
  .model('Items', {
    items: types.map(types.late(() => Item)),
  })
  .actions((self) => {

    /**
     * Fetch item by id (from cache or network)
     * @param {string} id Hackernews item id
     * @param {number} index Index of item in list
     * @return {Promise}
     */
    const fetchItem = flow(function* (id: string, { metadata = false, timeout = 0 } = {}) {
      const key = String(id);

      if (!self.items.has(key)) {

        const ref = db.ref(`v0/item/${id}`);
        const data = yield fetchRef(ref, timeout);

        if (!data) {
          // TODO: Make sure to cache deleted items so we don't need to fetch
          //       every time.
          return null;
        }

        data.id = key;
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
    });

    return {
      fetchItem,
    };
  })
  .create({
    items: {},
  });

export default Items;
