import Ember from 'ember';

export default Ember.Handlebars.makeBoundHelper(function(obj, options) {
  return (options.hash.pound ? '#' : '') + 'dom-' + obj.get('type') + '-' + obj.get('id');
});
