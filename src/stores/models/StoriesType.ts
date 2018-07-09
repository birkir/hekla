import { types } from 'mobx-state-tree';

export default types.enumeration('StoriesType', [
  'topstories',
  'newstories',
  'beststories',
  'askstories',
  'showstories',
  'jobstories',
]);

export const formatStoryType = (type) => {
  if (type === 'askstories') {
    return 'Ask HN';
  }
  if (type === 'showstories') {
    return 'Show HN';
  }
  if (type === 'jobstories') {
    return 'Jobs';
  }

  const justType = type.replace(/stories/, '');
  return `${justType.substr(0, 1).toUpperCase()}${justType.substr(1)} Stories`;
};
