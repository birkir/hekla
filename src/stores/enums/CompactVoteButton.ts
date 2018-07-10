import { types } from 'mobx-state-tree';

export const compactVoteButton = {
  left: 'Left',
  right: 'Right',
  noButtons: 'No Buttons',
};

export const formatCompactVoteButton = (key: string) => {
  return compactVoteButton[key];
};

export default types.enumeration('CompactVoteButton', Object.keys(compactVoteButton));
