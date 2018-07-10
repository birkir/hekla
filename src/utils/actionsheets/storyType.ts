import openActionSheet from '../openActionSheet';
import { storiesType, formatStoriesType } from 'stores/enums/StoriesType';
import Stories from 'stores/Stories';

const icons = {
  topstories: require('assets/icons/32/trophy.png'),
  newstories: require('assets/icons/32/new.png'),
  askstories: require('assets/icons/32/decision.png'),
  showstories: require('assets/icons/32/training.png'),
  jobstories: require('assets/icons/32/jobs.png'),
};

const options = Object.keys(storiesType).map((type: string) => ({
  id: type,
  title: formatStoriesType(type),
  titleTextAlignment: 0,
  icon: icons[type],
}));

export default cb => openActionSheet({ options, selectedId: Stories.type, cancel: 'Cancel' },  cb);
