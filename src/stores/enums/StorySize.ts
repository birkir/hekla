import { types } from 'mobx-state-tree';

export const storySize = {
  large: 'Large',
  compact: 'Compact',
};

export const formatStorySize = (key: string) => {
  return storySize[key];
};

export default types.enumeration('StorySize', Object.keys(storySize));
