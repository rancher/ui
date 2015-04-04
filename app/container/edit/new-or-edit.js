import Ember from 'ember';
import Cattle from 'ui/utils/cattle';

export default Ember.Mixin.create(Cattle.NewOrEditMixin, {
  needs: ['hosts'],

  actions: {
    validationError: function(err) {
      var msg;
      switch ( err.get('fieldName') )
      {
        case 'imageUuid':
          msg = 'Invalid source image name';
          break;
        default:
          msg = 'Invalid ' + err.get('fieldName');
          break;
      }

      this.set('error', msg);
    },
  },

  doneSaving: function() {
    var out = this._super();
    this.goToPrevious();
    return out;
  },

  // Ports
  protocolOptions: [
    {label: 'TCP', value: 'tcp'}, 
    {label: 'UDP', value: 'udp'}
  ],

  portsArray: null,
  initPorts: function() {
    var out = [];
    var ports = this.get('ports')||[];

    ports.forEach(function(value) {
      // Objects, from edit
      if ( value.id )
      {
        out.push({
          existing: true,
          obj: value,
          public: value.publicPort,
          private: value.privatePort,
          protocol: value.protocol,
        });
      }
      else
      {
        // Strings, from create maybe
        var match = value.match(/^(\d+):(\d+)\/(.*)$/);
        if ( match )
        {
          out.push({
            existing: false,
            public: match[1],
            private: match[2],
            protocol: match[3],
          });
        }
      }
    });

    this.set('portsArray', out);
  },

  // Links
  allHosts: function() {
    return this.get('store').all('host');
  }.property(),

  containerChoices: function() {
    var list = [];
    var id = this.get('id');

    this.get('allHosts').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't link to yourself, or to other types of instances
        return instance.get('id') !== id && instance.get('kind') === 'container';
      });

      list.pushObjects(containers.map(function(container) {
        return {
          group: host.get('name') || '('+host.get('id')+')',
          id: container.get('id'),
          name: container.get('name')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.instancesUpdated').volatile(),

  linksArray: null,
  linksAsStrArray: null,
  initLinks: function() {
    var out = [];
    var links = this.get('instanceLinks')||[];

    links.forEach(function(value) {
      // Objects, from edit
      if ( value.id )
      {
        out.push({
          existing: true,
          obj: value,
          linkName: value.linkName,
          targetInstanceId: value.targetInstanceId,
        });
      }
      else
      {
        // Strings, from create maybe
        var match = value.match(/^([^:]+):(.*)$/);
        if ( match )
        {
          out.push({linkName: match[1], targetInstanceId: match[2], existing: false});
        }
      }
    });

    this.set('linksArray', out);
  },
});
