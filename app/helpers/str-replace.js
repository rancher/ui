import Ember from 'ember';

export function strReplace(params, options) {
 return (params[0]+'').replace(options.match, options.with);
}

export default Ember.Helper.helper(strReplace);
