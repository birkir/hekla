import { types, flow } from 'mobx-state-tree';
import age from 'utils/age';
import Hackernews from '../services/Hackernews';

const User = types
  .model('User', {
    id: types.identifier(types.string),
    created: types.optional(types.number, 0),
    about: types.maybe(types.string),
    karma: types.optional(types.number, 0),
    submitted: types.optional(types.array(types.string), []),
    voted: types.optional(types.map(types.boolean), {}),
    hidden: types.optional(types.array(types.string), []),
    favorites: types.optional(types.array(types.string), []),
  })
  .views(self => ({
    get age() {
      return age(new Date(self.created * 1000));
    },
  }))
  .actions((self) => {

    // Proxy Hackernews service
    // While feeding results to the promise, set user flags.
    const fetchVoted = (type: 'submissions' | 'comments', page: number = 1) => flow(function* () {
      const res = yield Hackernews.voted(type, self.id, page);
      if (page === 0) {
        self.voted.clear();
      }
      res.forEach(item => self.voted.set(item.id, true));
      return res;
    })();

    const setVote = (id, flag) => {
      self.voted.set(id, flag);
    };

    return {
      fetchVoted,
      setVote,
    };
  });

export default User;
