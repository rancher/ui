import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('apikey');
  },

  enter: function() {
    this.send('setPageName','API');
  },

  actions: {
    newApikey: function() {
      this.transitionTo('apikeys.new');
    },
  },
});
