import { types, flow } from 'mobx-state-tree';
import { XmlEntities } from 'html-entities';
import flattenDeep from 'lodash/flattenDeep';
import age from 'utils/age';
import promptLogin from 'utils/promptLogin';
import Metadata from './Metadata';
import Items from '../Items';
import Hackernews from '../services/Hackernews';
import { db } from 'utils/firebase';
import Account from '../Account';

const entities = new XmlEntities();

const MAX_LEVELS = 5;
const ITEMS_PER_LEVEL = 5;

/**
 * Item model
 */
const Item = types.model('Item', {
  // Base fields
  id: types.identifier(types.string),
  type: types.string,
  by: types.maybe(types.string),
  descendants: types.optional(types.number, 0),
  kids: types.optional(types.array(types.number), []),
  score: types.maybe(types.number),
  time: types.number,
  title: types.maybe(types.string),
  text: types.maybe(types.string),
  url: types.maybe(types.string),
  parent: types.maybe(types.string),

  // App specific fields
  metadata: types.maybe(Metadata),
  belongsTo: types.optional(types.array(types.string), []),
  comments: types.optional(types.array(types.late(() => ItemReference)), []),
  offset: types.optional(types.number, 0),
  isPending: types.optional(types.boolean, false),
  isError: types.optional(types.boolean, false),
})
.views(self => ({
  get date() {
    return new Date(self.time * 1000);
  },

  get level() {
    return self.belongsTo.length;
  },

  get hackernewsUrl() {
    return `https://news.ycombinator.com/item?id=${self.id}`;
  },

  get isOwn() {
    return self.by === Account.userId;
  },

  get isVoted() {
    return !!Account.voted.get(self.id);
  },

  get isFavorited() {
    return !!Account.favorited.get(self.id);
  },

  get isHidden() {
    return !!Account.hidden.get(self.id);
  },

  get isFlagged() {
    return !!Account.flagged.get(self.id);
  },

  get isRead() {
    return Account.read.get(self.id);
  },

  get unfetched() {
    return Math.max(0, self.kids.length - self.offset);
  },

  get deepFetchedCount() {
    return self.comments.map(item => item.deepFetchedCount).reduce((a, b) => a + b, 0) + self.comments.length;
  },

  get ago() {
    return age(new Date(self.time * 1000));
  },

  get prettyText() {
    return entities.decode(self.text);
  },

  /**
   * Get recursive comments for this item in a flat array
   * [[1,2],[3,[4,5]],6] => [1,2,3,4,5,6]
   * @return {Array}
   */
  get flatComments() {
    return flattenDeep([
      ...self.comments.map((comment: any) => {
        if (!comment) return [];
        return [
          comment,
          ...comment.flatComments,
        ];
      }),
      ...((self as any).unfetched > 0 ? [{ comment: self, id: `More_${self.id}`, type: 'more' }] : []),
    ]);
  },
}))
.actions(self => ({

  /**
   * Fetch a single comment by id
   * @param id Item ID
   */
  async fetchComment(id: string, opts = { force: undefined, index: 0, all: false }) {
    try {
      // Fetch comment from backend (or cache)
      const comment = await Items.fetchItem(id, { force: opts.force }) as any;
      if (!comment) {
        return null;
      }
      // Update belongsTo list with parents
      comment.setBelongsTo([self.id, ...self.belongsTo]);
      // Fetch nested comments
      if (opts.index < (MAX_LEVELS - 1 - self.level) || opts.all) {
        await comment.fetchComments(opts);
      }
      return comment;
    } catch (err) {}
    return null;
  },

  /**
   * Fetch kids as comments
   */
  fetchComments({ force = true, offset = self.offset, all = false } = {}) {
    return flow(function* () {
      const end = offset > 0 ? 20 : (MAX_LEVELS - 1 - self.level) * ITEMS_PER_LEVEL;
      const limit = Math.min(20, Math.max(1, end));
      // Get list of comments to fetch
      const commentIds = all ? self.kids.map(String) : self.kids.slice(offset, offset + limit).map(String);
      // Fetch them
      const comments = yield Promise.all(commentIds.map((id, index) =>
        (self as any).fetchComment(id, { force, offset, index, all })));
      const addIds = comments.filter(n => n && n.id).map(n => n.id);
      // Push their id's
      if (offset === 0) {
        self.comments.replace(addIds);
      } else {
        self.comments.push(...addIds.filter(id => self.comments.indexOf(id) === -1));
      }
      self.offset = (offset + limit);
      // Return comments
      return self.comments;
    })();
  },

  fetchParent() {
    return flow(function* () {
      if (self.parent) {
        const parent = yield Items.fetchItem(self.parent);
        return parent;
      }
      return null;
    })();
  },

  refetch() {
    return flow(function* () {
      const ref = db.ref(`v0/item/${self.id}`);
      ref.keepSynced(true);

      const data = yield new Promise((resolve) => {
        ref.once('value').then(s => resolve(s.val()));
        setTimeout(() => ref.off('value') && resolve(null), 2500);
      });

      // Update model
      if (data) {
        self.by = data.by;
        self.descendants = data.descendants;
        self.kids = data.kids;
        self.score = data.score;
        self.time = data.time;
        self.title = data.title;
        self.text = data.text;
        self.url = data.url;
      }
    })();
  },

  read() {
    Account.toggle(self.id, 'read', true);
  },

  setMetadata(metadata: any) {
    self.metadata = metadata;
  },

  setBelongsTo(belongsTo: any) {
    self.belongsTo = belongsTo;
  },

  setIsError(flag: boolean) {
    self.isError = flag;
  },

  incrementScore(value) {
    self.score += value;
  },

  vote() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }
    const assumedFlag = !self.isVoted;
    Account.toggle(self.id, 'voted');
    (self as any).incrementScore((assumedFlag ? 1 : -1));
    Hackernews.vote(self.id, assumedFlag).then((flag: boolean) => {
      Account.toggle(self.id, 'voted', flag);
      if (flag !== assumedFlag) {
        (self as any).incrementScore((flag ? -1 : 1));
      }
    });
  },

  flag() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }
    const assumedFlag = !self.isFlagged;
    Account.toggle(self.id, 'flagged');
    Hackernews.flag(self.id, assumedFlag).then((flag: boolean) => {
      Account.toggle(self.id, 'flagged', flag);
    });
  },

  hide() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }
    const assumedFlag = !self.isHidden;
    Account.toggle(self.id, 'hidden');
    Hackernews.hide(self.id, assumedFlag).then((flag: boolean) => {
      Account.toggle(self.id, 'hidden', flag);
    });
  },

  favorite() {
    if (!Account.isLoggedIn) {
      return promptLogin();
    }
    const assumedFlag = !self.isFavorited;
    Account.toggle(self.id, 'favorited');
    Hackernews.favorite(self.id, assumedFlag).then((flag: boolean) => {
      Account.toggle(self.id, 'favorited', flag);
    });
  },

  delete() {
    return new Promise((resolve, reject) => {
      if (!Account.isLoggedIn) {
        return reject(promptLogin());
      }
      const ref = db.ref(`v0/item/${self.id}`);
      ref.on('value', async (s) => {
        ref.off('value');
        resolve(true);
      });
      try {
        const isDeleted = Hackernews.delete(self.id);
        if (!isDeleted) {
          reject('Could not delete');
        } else {
          self.text = null;
          self.by = null;
          resolve(true);
        }
      } catch (err) {
        reject(err.message);
      }
    });
  },

  /**
   * Reply to a story or a comment.
   * Will create a placeholder comment for display
   * and update it when changes are available in the backend.
   *
   * @param text Text to reply
   */
  reply(text: string) {
    return flow(function* () {

      if (!Account.isLoggedIn) {
        return promptLogin();
      }

      // Create placeholder comment
      const comment = Item.create({
        text,
        type: 'comment',
        id: `Placeholder_${Date.now()}`,
        by: Account.user.id,
        time: Math.floor(Date.now() / 1000),
        belongsTo: [self.id, ...self.belongsTo],
        isPending: true,
        isError: false,
      });

      // Add to bottom
      self.comments.push(comment);

      flow(function* () {
        try {
          // Make comment on Hacker News service
          const itemId = yield Hackernews.reply(self.type, self.id, Account.user.id, text);
          // Run function when item will be created in Firebase
          const ref = db.ref(`v0/item/${itemId}`);
          ref.keepSynced(true);
          ref.on('value', (s) => {
            if (s.val() !== null) {
              const item = (self as any).fetchComment(itemId);
              if (item) {
                const index = self.comments.findIndex((item: any) => item.id === comment.id);
                self.comments.splice(index, 1, itemId);
              } else {
                comment.setIsError(true);
                ref.off('value');
              }
            }
          });
        } catch (err) {
          comment.setIsError(true);
        }
      })();

      return comment;
    })();
  },
}));

/**
 * Getter and setter for item references
 * @param {string} identifier item.id
 * @return {Item}
 */
export const ItemReference = types.reference(Item, {
  get(identifier: string, parent: any) {
    return Items.items.get(identifier) || null;
  },
  set(value: any) {
    return value;
  },
});

export default Item;
