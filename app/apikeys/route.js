import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('apikey');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'API'});
  },

  actions: {
    newApikey: function() {
      this.transitionTo('apikeys.new');
    },
  },
});
