import Ember from 'ember';

export function domId(params) {
  var obj = params[0];
  return 'dom-' + obj.get('type') + '-' + obj.get('id');
}

export default Ember.Helper.helper(domId);
