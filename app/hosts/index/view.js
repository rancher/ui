import Ember from 'ember';

export default Ember.View.extend({
  pods: function() {
    var out = [];
    var hosts = this.get('context.hosts');
    var machines = this.get('context.machines');

    var knownMachines = hosts.map((host) => { return host.get('physicalHostId'); }).uniq();

    out.pushObjects(hosts.toArray());

    // Copy in the pending machines
    machines.forEach((machine) => {
      if ( machine.get('isPending') && knownMachines.indexOf(machine.get('id')) === -1 )
      {
        out.pushObject(Ember.Object.create({isPendingMachine: true, machine: machine, name: machine.get('name')}));
      }
    });

    return out.sortBy('name');
  }.property('context.hosts.[]','context.machines.@each.isPending'),
});
