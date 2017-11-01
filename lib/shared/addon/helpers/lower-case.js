import Ember from 'ember';

export function lowerCase(params) {
  return (params[0]||'').toLowerCase();
}

export default Ember.Helper.helper(lowerCase);
