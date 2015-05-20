import Ember from 'ember';
import Util from 'ui/utils/util';

export default Ember.Handlebars.makeBoundHelper(function(obj, options) {
  return (options.hash.pound ? '#' : '') + 'dom-' + obj.get('type') + '-' + obj.get('id');
});
