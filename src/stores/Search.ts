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

const HitItem = types.model('HitItem', {
  id: types.identifier(types.string),
  title: types.string,
});

const Search = types.model('Search', {
  trending: types.optional(types.array(HitItem), []),
  items: types.optional(types.array(ItemReference), []),
  query: types.optional(types.string, ''),
  page: types.optional(types.number, 0),
  tags: types.optional(types.array(types.string), []),
  sort: types.optional(types.enumeration('Sort', ['search', 'search_by_date']), 'search'),
  isLoading: types.optional(types.boolean, false),
})
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

    const tags = self.tags.length > 0 ? `&tags=${encodeURIComponent(`${self.tags.join(`,`)}`)}` : '';
    const noDupes = id => !self.items.find((item: IItemType) => item.id === id);
    const result = yield fetch(`http://hn.algolia.com/api/v1/${self.sort}?query=${self.query}&page=${self.page}${tags}`).then(res => res.json());

    // Map item ids to string
    const storyIds = result.hits.map((hit: AlgoliaHit) => hit.objectID).filter(noDupes);

    // Resolve all items
    yield Promise.all(storyIds.map(Items.fetchItem));

    // Push items into stories array
    // We filter twice because of race condition
    self.items.push(...storyIds.filter(noDupes));

    self.isLoading = false;
  }),

  /**
   * Fetch trending stuff
   */
  fetchTrending: flow(function* (duration: number = 24 * 60 * 60) {
    const date = (Date.now() / 1000) - duration;
    const opts = {
      body: `{"params":"query=&hitsPerPage=5&minWordSizefor1Typo=4&minWordSizefor2Typos=8&advancedSyntax=true&ignorePlurals=false&clickAnalytics=true&tagFilters=%5B%22story%22%5D&numericFilters=%5B%22created_at_i%3E${date}%22%5D&page=0&queryType=prefixLast&typoTolerance=true&restrictSearchableAttributes=%5B%5D"}`,
      method:'POST',
    };
    const result = yield fetch(`https://uj5wyc0l7x-dsn.algolia.net/1/indexes/Item_production_ordered/query?x-algolia-application-id=UJ5WYC0L7X&x-algolia-api-key=8ece23f8eb07cd25d40262a1764599b1`, opts)
      .then(res => res.json());

    self.trending.replace(result.hits.map(item => ({ id: item.objectID, title: item.title })));
  }),

  nextPage() {
    self.page += 1;
  },

  setQuery(query: string) {
    self.query = query;
  },

  setTags(tags: string[]) {
    self.tags.replace(tags);
  },

  setSort(sort: 'search' | 'search_by_date') {
    self.sort = sort;
  },

  clear() {
    self.page = 0;
    self.items.clear();
  },
}))
.create();

export default Search;
