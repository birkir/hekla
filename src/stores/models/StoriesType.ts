import { types } from 'mobx-state-tree';

export default types.enumeration('StoriesType', [
  'topstories',
  'newstories',
  'beststories',
  'askstories',
  'showstories',
  'jobstories',
]);
