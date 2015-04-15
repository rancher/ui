import Ember from 'ember';

// Requires: hostChoices
export default Ember.Mixin.create({
  targetChoices: function() {
    var list = [];

    this.get('hostChoices').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't balance other types of instances, or system containers, or containers on unmanaged network
        return instance.get('type') === 'container' && instance.get('systemContainer') === null && instance.get('hasManagedNetwork');
      });

      list.pushObjects(containers.map(function(container) {
        return {
          group: host.get('name') || ('(Host '+host.get('id')+')'),
          id: container.get('id'),
          name: container.get('name') || ('(' + container.get('id') + ')')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('hostChoices.@each.instancesUpdated').volatile(),
});
