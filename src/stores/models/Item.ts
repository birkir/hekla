import { types, flow } from 'mobx-state-tree';
import { XmlEntities } from 'html-entities';
import flattenDeep from 'lodash/flattenDeep';
import age from 'utils/age';
import Metadata from './Metadata';
import Items from '../Items';
import Hackernews from '../services/Hackernews';
import { db } from 'utils/firebase';
import Account from '../Account';

const entities = new XmlEntities();

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

  // User fields
  isUserVote: types.optional(types.boolean, false),
  isUserFlag: types.optional(types.boolean, false),
  isUserHidden: types.optional(types.boolean, false),
  isUserFavorite: types.optional(types.boolean, false),
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

  /**
   * Print date in short format like `10h` or `6w`
   * @return {string}
   */
  get ago() {
    return age(new Date(self.time * 1000));
  },

  get prettyText() {
    return entities.decode(self.text);
  },

  /**
   * Get recursive comments for this item in flat array
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
    ]);
  },
}))
.actions((self) => {

  const fetchParent = async () => {
    if (self.parent) {
      const parent = await Items.fetchItem(self.parent);
      return parent;
    }
    return null;
  };

  const fetchComments = flow(function* () {

    const commentIds = self.kids.map(String);

    yield Promise.all(
      commentIds.map(async (id, index) => {
        // Fetch comment from backend (or cache)
        let comment;

        try {
          comment = await Items.fetchItem(id) as any;
        } catch (err) {}

        if (!comment) {
          commentIds.splice(commentIds.indexOf(id), 1);
          return;
        }

        // Update belongsTo list with parents
        comment.setBelongsTo([self.id, ...self.belongsTo]);

        // Fetch nested comments
        await comment.fetchComments();
      }),
    );

    // Push commentIds to comments list
    self.comments.replace(commentIds);

    return self.comments;
  });

  return {
    fetchComments,
    fetchParent,

    setMetadata(metadata: any) {
      self.metadata = metadata;
    },

    setBelongsTo(belongsTo: any) {
      self.belongsTo = belongsTo;
    },

    vote() {
      self.isUserVote = !self.isUserVote;
      const completed = Hackernews.vote(self.id, self.isUserVote);
      if (completed) {
        Account.user.setVote(self.id, self.isUserVote);
      }
      return completed;
    },

    flag() {
      self.isUserFlag = !self.isUserFlag;
      return Hackernews.flag(self.id, self.isUserFlag);
    },

    hide() {
      self.isUserHidden = !self.isUserHidden;
      return Hackernews.hide(self.id, self.isUserHidden);
    },

    favorite() {
      self.isUserFavorite = !self.isUserFavorite;
      return Hackernews.favorite(self.id, self.isUserFavorite);
    },

    delete() {
      return new Promise((resolve, reject) => {
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

    reply(text: string) {
      return new Promise(async (resolve, reject) => {
        const ref = db.ref(`v0/item/${self.id}/kids`);

        ref.on('value', async (s) => {
          const ids = (Object as any).values(s.val());
          const items = await Promise.all(ids.map(Items.fetchItem));
          const item = items
            .filter((item: any) => item.by === Account.user.id)
            .sort((a: any, b: any) => b.time - a.time)
            .shift();

          if (item) {
            resolve(item);
          }
        });

        try {
          const isReply = await Hackernews.reply(this.props.itemId, this.state.text);
          if (!isReply) {
            ref.off('value');
            reject('Could not reply.');
          }
        } catch (err) {
          ref.off('value');
          reject(err.message);
        }
      });
    },
  };
});

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
