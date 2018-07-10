import { types } from 'mobx-state-tree';

export const compactThumbnail = {
  left: 'Left',
  right: 'Right',
  noThumbnails: 'No Thumbnails',
};

export const formatCompactThumbnail = (key: string) => {
  return compactThumbnail[key];
};

export default types.enumeration('CompactThumbnail', Object.keys(compactThumbnail));
