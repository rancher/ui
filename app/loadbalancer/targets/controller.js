import Ember from 'ember';

export default Ember.ObjectController.extend({
  addDisabled: function() {
    return !this.get('actions.settargets');
  }.property('actions.settargets'),

  arrangedTargets: function() {
    var targets = this.get('loadBalancerTargets');

    return Ember.ArrayController.create({
      content: targets,
      sortProperties: ['ipAddress', 'instance.name', 'instance.id', 'instanceId']
    });
  }.property('instances.[]','loadBalancerTargets.@each.{instanceId,ipAddress}'),

  actions: {
    newTarget: function() {
      this.transitionToRoute('loadbalancer.targets.new');
    },
  },
});
