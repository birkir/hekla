import { types } from 'mobx-state-tree';

const Metadata = types
  .model('Metadata', {
    title: types.maybe(types.string),
    description: types.maybe(types.string),
    author: types.maybe(types.string),
    tags: types.maybe(types.array(types.string)),
    image: types.maybe(types.string),
  });

export default Metadata;
