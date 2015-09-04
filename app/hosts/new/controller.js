import Ember from 'ember';

export default Ember.ObjectController.extend({
  lastRoute: 'hosts.new.digitalocean',
  drivers: function() {
    var store = this.get('store');
    var has = store.hasRecordFor.bind(store,'schema');

    return [
      {route: 'hosts.new.amazonec2',    label: 'Amazon EC2',    css: 'amazon',       available: has('amazonec2config')  },
      {route: 'hosts.new.digitalocean', label: 'DigitalOcean',  css: 'digitalocean', available: has('digitaloceanconfig')  },
      {route: 'hosts.new.exoscale',     label: 'Exoscale',      css: 'exoscale',     available: has('exoscaleconfig') },
      {route: 'hosts.new.packet',       label: 'Packet',        css: 'packet',       available: has('packetconfig') },
      {route: 'hosts.new.rackspace',    label: 'RackSpace',     css: 'rackspace',    available: has('rackspaceconfig') },
      {route: 'hosts.new.custom',       label: 'Custom',        css: 'custom',       available: true  },
    ];
  }.property(),
});
