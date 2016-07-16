import Ember from 'ember';

export function include(params) {
  const [items, value] = params;
  return items.indexOf(value) > -1;
}

export default Ember.Helper.helper(include);
