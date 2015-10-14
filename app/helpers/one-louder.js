import Ember from 'ember';

export function oneLouder(params) {
  return parseInt(params[0],10) + 1;
}

export default Ember.Helper.helper(oneLouder);
