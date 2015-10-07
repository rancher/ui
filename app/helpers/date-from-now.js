import Ember from 'ember';

export function dateFromNow(params) {
  return moment(params[0]).fromNow();
}

export default Ember.Helper.helper(dateFromNow);
