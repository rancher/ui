import Ember from 'ember';

export default Ember.Controller.extend({
  mode        : 'grouped',
  show        : 'standard',
  showSystem  : null,
  queryParams : ['mode','show'],

  actions: {
    newContainer: function(hostId) {
      this.transitionToRoute('containers.new', {queryParams: {hostId: hostId}});
    },
  },

  // showChanged should be an observer rather then init to correctly set the showSystem checkbox
  // if showSystem is set on init show does not contain the correct qp as the router has not set it
  // so the checkbox never gets set
  showChanged: function() {
    this.set('showSystem', this.get('show') === 'all');
  }.observes('show'),

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
