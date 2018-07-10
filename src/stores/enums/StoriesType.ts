import { types } from 'mobx-state-tree';

export const storiesType = {
  topstories: 'Top Stories',
  newstories: 'New Stories',
  askstories: 'Ask HN',
  showstories: 'Show HN',
  jobstories: 'Jobs',
};

export default types.enumeration('StoriesType', Object.keys(storiesType));

export const formatStoriesType = (key: string) => {
  return storiesType[key];
};
