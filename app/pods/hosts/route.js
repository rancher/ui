import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    console.log('hosts model');
    return this.get('store').findAll('host');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Hosts'});
  },
});
