import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    newRegistry: function() {
      this.transitionTo('registries.new');
    },
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Registries', addRoute: 'registries.new'});
  },
});
