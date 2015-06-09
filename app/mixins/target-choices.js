import Ember from 'ember';

// Requires: hostChoices
export default Ember.Mixin.create({
  targetChoices: function() {
    var list = [];

    this.get('hostChoices').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        return instance.get('type') === 'container' && // You can't balance other types of instances
               instance.get('systemContainer') === null && // or system containers
               instance.get('hasManagedNetwork') && // or unmanaged network containers
               ['removed','purging','purged'].indexOf(instance.get('state')) === -1; // or removed containers
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
