import Ember from 'ember';
import UnremovedArrayProxy from 'ui/utils/unremoved-array-proxy';

export default Ember.ObjectController.extend({
  addDisabled: function() {
    return !this.get('actions.settargets');
  }.property('actions.settargets'),

  arrangedTargets: function() {
    return UnremovedArrayProxy.create({
      sourceContent: this.get('loadBalancerTargets'),
      sortProperties: ['ipAddress', 'instance.name', 'instance.id', 'instanceId']
    });
  }.property('instances.[]','loadBalancerTargets.@each.{instanceId,ipAddress}'),

  actions: {
    newTarget: function() {
      this.transitionToRoute('loadbalancer.targets.new');
    },
  },
});
