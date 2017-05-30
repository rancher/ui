import Ember from 'ember';

export function hostPublicValues(params/*, hash*/) {
  var [host] = params;
  var pv = host.publicValues[`${host.driver}Config`];
  return pv;
}

export default Ember.Helper.helper(hostPublicValues);
