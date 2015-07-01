import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('apikey');
  },

  actions: {
    newApikey: function() {
      this.transitionTo('settings.apikeys.new');
    },
  },
});
