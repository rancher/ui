import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function() {
    let lastRoute = this.controllerFor('hosts/new').get('lastRoute');
    this.transitionTo('hosts.new', {queryParams: {driver: lastRoute}});
  }
});
