import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.modelFor('hosts');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Hosts'});
  },
});
