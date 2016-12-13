import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    this.replaceWith('swarm-tab.console');
  }
});
