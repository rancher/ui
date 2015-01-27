import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    newContainer: function() {
      this.transitionTo('newContainer');
    },
  },

  model: function() {
    console.log('hosts model');
    return this.get('store').findAll('host');
  },

  renderTemplate: function() {
    this._super();
    this.send('setPageName','Hosts');
  },
});
