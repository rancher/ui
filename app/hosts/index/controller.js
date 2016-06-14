import Ember from 'ember';

export default Ember.Controller.extend({
  mode: 'grouped',
  show: 'standard',
  queryParams: ['mode','show'],

  actions: {
    newContainer: function(hostId) {
      this.transitionToRoute('containers.new', {queryParams: {hostId: hostId}});
    },
  },

  showSystem: null,
  initSystem: function() {
    this.set('showSystem', this.get('show') == 'all');
  }.on('init'),
  showSystemChanged: function() {
    this.set('show', (this.get('showSystem') ? 'all' : 'standard'));
  }.observes('showSystem'),

  pods: function() {
    var out = [];
    var hosts = this.get('model.hosts');
    var machines = this.get('model.machines');

    var knownMachines = hosts.map((host) => { return host.get('physicalHostId'); }).uniq();

    out.pushObjects(hosts.toArray());

    // Copy in the pending machines
    machines.forEach((machine) => {
      if ( machine.get('isPending') && knownMachines.indexOf(machine.get('id')) === -1 )
      {
        out.pushObject(Ember.Object.create({
          isPendingMachine: true,
          machine: machine,
          name: machine.get('name'),
          displayName: machine.get('name')
        }));
      }
    });

    return out.sortBy('displayName','id');
  }.property('model.hosts.@each.{name,id,physicalHostId}','model.machines.@each.{name,id,isPending}'),

  listLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'dot',
    },
  },

  groupLinkOptions: {
    route: 'hosts',
    options: {
      mode: 'grouped',
    },
  }
});
