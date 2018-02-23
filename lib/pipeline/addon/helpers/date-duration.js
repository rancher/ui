import Ember from 'ember';

export function dateDuration(params) {
  return Math.round(moment.duration(params[0], "ms").as('s'));
}

export default Ember.Helper.helper(dateDuration);
