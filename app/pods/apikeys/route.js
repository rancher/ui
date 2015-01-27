import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('apikey');
  },

  renderTemplate: function() {
    this._super();
    this.send('setPageName','API');
  },

  actions: {
    newApikey: function() {
      this.transitionTo('apikeys.new');
    },
  },
});
