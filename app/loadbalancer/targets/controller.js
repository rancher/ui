import Ember from 'ember';

export default Ember.ObjectController.extend({
  addDisabled: function() {
    return !this.get('actions.settargets');
  }.property('actions.settargets'),

  actions: {
    newTarget: function() {
      this.transitionToRoute('loadbalancer.targets.new');
    },
  },
});
