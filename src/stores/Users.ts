import { flow, types } from 'mobx-state-tree';
import { db } from 'utils/firebase';
import User from './models/User';

const Users = types
  .model('Users', {
    users: types.map(User),
  })
  .actions(self => ({
    fetchUserById(id: string) {
      return flow(function* () {
        if (!self.users.has(id)) {
          const res = yield db.ref(`v0/user/${id}`)
            .once('value')
            .then(s => s.val());
          if (res) {
            res.submitted = (res.submitted || []).map(n => String(n));
          }
          const user = User.create(res);

          if (!self.users.has(id)) {
            self.users.set(id, user);
          }
        }
        return self.users.get(id);
      })();
    },
  }))
  .create({
    users: {},
  });

export default Users;
