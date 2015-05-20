import Ember from 'ember';

export default Ember.View.extend({
  pods: function() {
    var out = [];
    var hosts = this.get('context.hosts');
    var machines = this.get('context.machines');

    out.pushObjects(hosts.toArray());

    // Copy in the pending machines
    machines.forEach((machine) => {
      if ( machine.get('isPending') )
      {
        out.pushObject(Ember.Object.create({isPendingMachine: true, machine: machine, name: machine.get('name')}));
      }
    });

    return out.sortBy('name');
  }.property('context.hosts.[]','context.machines.@each.isPending'),
});
