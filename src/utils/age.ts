import distance_in_words_to_now from 'date-fns/distance_in_words_to_now';

export default (date: Date) => distance_in_words_to_now(date)
  .replace(/almost|about|ago|over/, '')
  .replace('less than a minute', '<1m')
  .replace(/months?/, 'mo')
  .replace(/(year|week|day|hour|minute|second)s?/, r => r[0])
  .replace(/ /g, '');
