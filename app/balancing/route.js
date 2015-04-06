import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Load Balancing'});
  },
});
