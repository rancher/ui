import Ember from 'ember';

export function indexAdd(params) {
  return params[0]+1;
}

export default Ember.Helper.helper(indexAdd);
