import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    newHost: function() {
      this.transitionToRoute('loadbalancer.hosts.new');
    },
  },
});
