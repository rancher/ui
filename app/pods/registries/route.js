import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('registry');
  },

  actions: {
    newRegistry: function() {
      this.transitionTo('registries.new');
    },
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Private Registries'});
  },
});
