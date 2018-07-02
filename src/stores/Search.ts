import { types, flow } from 'mobx-state-tree';
import Item, { ItemReference } from './models/Item';
import Items from './Items';

type IItemType = typeof Item.Type;

interface HighlightResult {
  fullyHighlighted?: boolean;
  matchLevel?: 'full' | 'none' | '';
  matchedWords: string[];
  value: string;
}

interface AlgoliaHit {
  author: string;
  comment_text: string;
  created_at: string;
  created_at_i: number;
  num_comments?: number;
  objectID: string;
  parent_id?: number;
  points?: number;
  story_id?: number;
  story_text?: string;
  story_title?: string;
  story_url?: string;
  title?: string;
  url?: string;
  _highlightResult: { [s: string]: HighlightResult };
  _tags: string[];
}

const Search = types.model('Search', {
  items: types.optional(types.array(ItemReference), []),
  query: types.optional(types.string, ''),
  page: types.optional(types.number, 0),
  sort: types.optional(types.enumeration('Sort', ['search', 'search_by_date']), 'search'),
  isLoading: types.optional(types.boolean, false),
})
.views(self => ({
}))
.actions(self => ({
  /**
   * Fetch stories by props set to Stories
   * @param {boolean} more Fetch more?
   * @param {boolean} reload Should refresh all the stuff
   */
  search: flow(function* () {

    if (self.query === '') {
      return;
    }

    self.isLoading = true;

    const noDupes = id => !self.items.find((item: IItemType) => item.id === id);
    const result = yield fetch(`http://hn.algolia.com/api/v1/${self.sort}?query=${self.query}&page=${self.page}`).then(res => res.json());

    // Map item ids to string
    const storyIds = result.hits.map((hit: AlgoliaHit) => hit.objectID).filter(noDupes);

    // Resolve all items
    yield Promise.all(storyIds.map(Items.fetchItem));

    // Push items into stories array
    // We filter twice because of race condition
    self.items.push(...storyIds.filter(noDupes));

    self.isLoading = false;
  }),

  nextPage() {
    self.page += 1;
  },

  setQuery(query: string) {
    self.query = query;
  },

  clear() {
    self.items.clear();
  },
}))
.create();

export default Search;
