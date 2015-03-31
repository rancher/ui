import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('store').findAll('volume');
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Volumes'});
  },
});
