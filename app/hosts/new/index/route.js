import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    this.transitionTo(this.controllerFor('hosts/new').get('lastRoute'));
  }
});
