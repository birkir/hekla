import { types } from 'mobx-state-tree';

const Metadata = types
  .model('Metadata', {
    title: types.maybe(types.string),
    description: types.maybe(types.string),
    type: types.maybe(types.string),
    image: types.maybe(types.model({
      url: types.maybe(types.string),
      width: types.maybe(types.number),
      height: types.maybe(types.number),
    })),
  });

export default Metadata;
