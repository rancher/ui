import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('authStore').find('config', null, {forceReload: true}).then(function(collection) {
      return collection;
    });
  },
});
