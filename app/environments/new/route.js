import Ember from 'ember';

export default Ember.Route.extend({
  model: function(/*params, transition*/) {
    return this.get('store').createRecord({
      type: 'environment'
    });
  },

  activate: function() {
    this.send('setPageLayout', {label: 'Back', backRoute: 'environments'});
  },

  actions: {
    cancel: function() {
      this.transitionTo('environments');
    },
  }
});
