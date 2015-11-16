import Ember from 'ember';

export function concatStr(params) {
  return params[0].join(' ');
}

export default Ember.Helper.helper(concatStr);
