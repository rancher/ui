import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('registry');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Registries'});
  },
});
