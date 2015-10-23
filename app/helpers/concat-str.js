import Ember from 'ember';

export function concatStr(params) {
  return params.join('');
}

export default Ember.Helper.helper(concatStr);
