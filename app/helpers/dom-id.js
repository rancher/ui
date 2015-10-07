import Ember from 'ember';

export function domId(params, options) {
  var obj = params[0];
  return (options && options.hash && options.hash.pound ? '#' : '') + 'dom-' + obj.get('type') + '-' + obj.get('id');
}

export default Ember.Helper.helper(domId);
