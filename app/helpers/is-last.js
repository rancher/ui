import Ember from 'ember';

export function isLast(params/*, hash*/) {
  let ary = params[0];
  let idx = params[1];

  return (idx+1) >= Ember.get(ary,'length');
}

export default Ember.Helper.helper(isLast);
