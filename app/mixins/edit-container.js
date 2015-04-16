import Ember from 'ember';
import Cattle from 'ui/utils/cattle';
import ShellQuote from 'npm:shell-quote';

export default Ember.Mixin.create(Cattle.NewOrEditMixin, {
  needs: ['hosts'],
  queryParams: ['tab','hostId','advanced'],
  tab: 'command',
  hostId: null,
  advanced: false,

  primaryResource: Ember.computed.alias('model.instance'),

  actions: {
    toggleAdvanced: function() {
      this.set('advanced', !this.get('advanced'));
    },

    addEnvironment: function() {
      this.get('environmentArray').pushObject({key: '', value: ''});
    },
    removeEnvironment: function(obj) {
      this.get('environmentArray').removeObject(obj);
    },

    addPort: function() {
      this.get('portsArray').pushObject({public: '', private: '', protocol: 'tcp'});
    },
    removePort: function(obj) {
      this.get('portsArray').removeObject(obj);
    },

    addLink: function() {
      this.get('linksArray').pushObject({linkName: '', targetInstanceId: null});
    },
    removeLink: function(obj) {
      this.get('linksArray').removeObject(obj);
    },

    addVolume: function() {
      this.get('volumesArray').pushObject({value: ''});
    },
    removeVolume: function(obj) {
      this.get('volumesArray').removeObject(obj);
    },

    addVolumeFrom: function() {
      this.get('volumesFromArray').pushObject({value: ''});
    },
    removeVolumeFrom: function(obj) {
      this.get('volumesFromArray').removeObject(obj);
    },

    addDns: function() {
      this.get('dnsArray').pushObject({value: ''});
    },
    removeDns: function(obj) {
      this.get('dnsArray').removeObject(obj);
    },

    addDnsSearch: function() {
      this.get('dnsSearchArray').pushObject({value: ''});
    },
    removeDnsSearch: function(obj) {
      this.get('dnsSearchArray').removeObject(obj);
    },

    addDevice: function() {
      this.get('devicesArray').pushObject({host: '', container: '', permissions: 'rwm'});
    },
    removeDevice: function(obj) {
      this.get('devicesArray').removeObject(obj);
    },

    chooseRegistry: function(registry) {
      var found = false;
      this.get('registryChoices').forEach((choice) => {
        var prefix = choice.get('serverAddress')+':';

        if ( registry && choice.get('id') === registry.get('id') )
        {
          found = true;
          choice.set('active', true);
          this.set('displayPrefix', prefix);
          this.set('selectedRegistry', choice);
          var credentials = choice.get('credentials');
          if ( credentials )
          {
            credentials = credentials.filter((cred) => {
              return cred.get('state') === 'active';
            }).sortBy('email','publicValue','id');
          }
          this.set('credentialChoices', credentials);
        }
        else
        {
          choice.set('active', false);
        }
      });

      if (!found)
      {
        this.set('displayPrefix', 'docker:');
        this.set('selectedRegistry', null);
        this.set('credentialChoices', null);
      }

      this.set('instance.registryCredentialId', this.get('credentialChoices.firstObject.id'));
    },
  },

  // ----------------------------------
  // Setup
  // ----------------------------------
  initFields: function() {
    this._super();
    this.initPorts();
    this.initLinks();

    if ( !this.get('editing') )
    {
      this.initNetwork();
      this.initEnvironment();
      this.initPorts();
      this.initLinks();
      this.initVolumes();
      this.initVolumesFrom();
      this.initDns();
      this.initDnsSearch();
      this.initCapability();
      this.initDevices();
      this.userImageUuidDidChange();
      this.terminalDidChange();
      this.restartDidChange();
      this.send('chooseRegistry', null);
      this.set('restartLimit', 5);
      this.set('restart', 'no'); // This has to come after restartLimit because changing the limit sets restart.
      this.set('terminal', 'both');
      this.set('memoryMb',null);
      this.set('strEntryPoint','');
    }
  },

  // ----------------------------------
  // Image
  // ----------------------------------
  selectedRegistry: null,
  displayPrefix: '',
  userImageUuid: 'ubuntu:14.04.1',
  credentialChoices: null,
  showCredential: Ember.computed.gt('credentialChoices.length',0),
  showCredentialChoice: Ember.computed.gt('credentialChoices.length',1),
  userImageUuidDidChange: function() {
    var input = (this.get('userImageUuid')||'').trim();
    var choices = this.get('registryChoices')||[];

    var uuid = 'docker:';

    // Look for a redundant docker: pasted in
    if ( input.indexOf(uuid) === 0 )
    {
      this.send('chooseRegistry', null);
      this.set('userImageUuid', input.substr(uuid.length));
      return;
      // We'll be back around again because userImageUuid was re-changed
    }

    // Look for a private registry with the matching prefix
    var prefix, choice;
    for ( var i = 0 ; i < choices.get('length') ; i++ )
    {
      choice = choices.objectAt(i);
      prefix = choice.get('serverAddress')+'/';
      choice.set('selected', false);
      if ( input.indexOf(prefix) === 0 )
      {
        this.send('chooseRegistry', choice);
        this.set('userImageUuid', input.substr(prefix.length));
        return;
        // We'll be back around again because userImageUuid was re-changed
      }
    }

    if ( input  && input.length )
    {
      // Update the actual uuid on the container
      var registry = this.get('selectedRegistry.serverAddress');
      if ( registry )
      {
        uuid += registry + '/';
      }

      uuid += input;

      this.set('instance.imageUuid', uuid);
    }
    else
    {
      this.set('instance.imageUuid', null);
    }
  }.observes('selectedRegistry.serverAddress','userImageUuid'),

  credentialChoicesChanged: function() {
    var found = false;
    var id = this.get('instance.registryCredentialId');
    (this.get('credentialChoices')||[]).forEach((choice) => {
      if ( choice.get('id') === id )
      {
        found = true;
      }
    });

    if ( !found )
    {
      this.set('instance.registryCredentialId',null);
    }
  }.observes('credentialChoices.@each.id','instance.registryCredentialId'),


  // ----------------------------------
  // Restart
  // ----------------------------------
  restart: null, //'no',
  restartLimit: null, //5,

  restartDidChange: function() {
    var policy = {};
    var name = this.get('restart');
    var limit = parseInt(this.get('restartLimit'),10);

    if ( name === 'on-failure-cond' )
    {
      name = 'on-failure';
      if ( limit > 0 )
      {
        policy.maximumRetryCount = limit;
      }
    }

    policy.name = name;
    this.set('instance.restartPolicy', policy);
  }.observes('restart','restartLimit'),

  restartLimitDidChange: function() {
    this.set('restart', 'on-failure-cond');
  }.observes('restartLimit'),

  // ----------------------------------
  // Network
  // ----------------------------------
  networkId: null,
  initNetwork: function() {
    var networkIds = this.get('instance.networkIds');
    if ( networkIds && networkIds.length > 0 )
    {
      this.set('networkId', networkIds[0]);
    }
    else
    {
      this.set('networkId', null);
    }
  },

  networkIdDidChange: function() {
    var ary = this.get('instance.networkIds')||[];
    ary.clear();
    ary.push(this.get('networkId'));
  }.observes('networkId'),

  // ----------------------------------
  // Links
  // ----------------------------------
  containerChoices: function() {
    var list = [];
    var id = this.get('id');

    var expectContainerIds = (this.get('linksArray')||[]).map(function(obj) {
      return Ember.get(obj,'targetInstanceId');
    });

    this.get('allHosts').map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't link to yourself, or to other types of instances, or to system containers
        return instance.get('id') !== id &&
               instance.get('kind') === 'container' &&
               !instance.get('systemContainer');
      });

      var hostLabel = 'Host: ' + (host.get('name') || '('+host.get('id')+')');
      if ( host.get('state') !== 'active' )
      {
        hostLabel += ' (' + host.get('state') + ')';
      }

      list.pushObjects(containers.map(function(container) {
        expectContainerIds.removeObject(container.get('id'));

        var containerLabel = (container.get('name') || '('+container.get('id')+')');
        if ( container.get('state') !== 'running' )
        {
          containerLabel += ' (' + container.get('state') + ')';
        }

        return {
          group: hostLabel,
          id: container.get('id'),
          name: containerLabel,
        };
      }));
    });

    if ( expectContainerIds.get('length') )
    {
      // There are some links to containers which are not in the list somehow..
      expectContainerIds.forEach((id) => {
        var container = this.get('store').getById('container',id);
        return {
          group: 'Host: ???',
          id: id,
          name: (container && container.get('name') ? container.get('name') : '('+id+')')
        };
      });
    }

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.instancesUpdated').volatile(),

  linksArray: null,
  linksAsMap: null,
  linksDidChange: function() {
    // Sync with the actual environment
    var out = {};
    this.get('linksArray').forEach(function(row) {
      if ( row.linkName && row.targetInstanceId )
      {
        out[ row.linkName ] = row.targetInstanceId;
      }
    });

    this.set('linksAsMap', out);
  }.observes('linksArray.@each.{linkName,targetInstanceId}'),

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

  // ----------------------------------
  // Environment Vars
  // ----------------------------------
  environmentArray: null,
  initEnvironment: function() {
    var obj = this.get('environment')||{};
    var keys = Object.keys(obj);
    var out = [];
    keys.forEach(function(key) {
      out.push({ key: key, value: obj[key] });
    });

    this.set('environmentArray', out);
  },

  environmentChanged: function() {
    // Sync with the actual environment object
    var out = {};
    this.get('environmentArray').forEach(function(row) {
      if ( row.key )
      {
        out[row.key] = row.value;
      }
    });
    this.set('instance.environment', out);
  }.observes('environmentArray.@each.{key,value}'),

  // ----------------------------------
  // Ports
  // ----------------------------------
  portsAsStrArray: null,
  portsArrayDidChange: function() {
    var out = [];
    this.get('portsArray').forEach(function(row) {
      if ( row.private && row.protocol )
      {
        var str = row.private+'/'+row.protocol;
        if ( row.public )
        {
          str = row.public + ':' + str;
        }

        out.push(str);
      }
    });

    this.set('portsAsStrArray', out);
  }.observes('portsArray.@each.{public,private,protocol}'),

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

  // ----------------------------------
  // Volumes
  // ----------------------------------
  volumesArray: null,
  initVolumes: function() {
    this.set('instance.dataVolumes', []);
    this.set('volumesArray', []);
  },

  volumesDidChange: function() {
    var out = this.get('instance.dataVolumes');
    out.beginPropertyChanges();
    out.clear();
    this.get('volumesArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('volumesArray.@each.value'),

  // ----------------------------------
  // Volumes From
  // ----------------------------------
  hostContainerChoices: function() {
    var list = [];

    this.get('allHosts').filter((host) => {
      return host.get('id') === this.get('instance.requestedHostId');
    }).map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't mount volumes from other types of instances
        return instance.get('type') === 'container';
      });

      list.pushObjects(containers.map(function(container) {
        return {
          group: 'Host: ' + (host.get('name') || '('+host.get('id')+')'),
          id: container.get('id'),
          name: container.get('name')
        };
      }));
    });

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.instancesUpdated').volatile(),

  volumesFromArray: null,
  initVolumesFrom: function() {
    this.set('instance.dataVolumesFrom', []);
    this.set('volumesFromArray', []);
  },

  volumesFromDidChange: function() {
    var out = this.get('instance.dataVolumesFrom');
    out.beginPropertyChanges();
    out.clear();
    this.get('volumesFromArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('volumesFromArray.@each.value'),

  // ----------------------------------
  // DNS
  // ----------------------------------
  dnsArray: null,
  initDns: function() {
    this.set('instance.dns', []);
    this.set('dnsArray', []);
  },

  dnsDidChange: function() {
    var out = this.get('instance.dns');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsArray.@each.value'),

  // ----------------------------------
  // DNS Search
  // ----------------------------------
  dnsSearchArray: null,
  initDnsSearch: function() {
    this.set('instance.dnsSearch', []);
    this.set('dnsSearchArray', []);
  },
  dnsSearchDidChange: function() {
    var out = this.get('instance.dnsSearch');
    out.beginPropertyChanges();
    out.clear();
    this.get('dnsSearchArray').forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });
    out.endPropertyChanges();
  }.observes('dnsSearchArray.@each.value'),

  // ----------------------------------
  // Capability
  // ----------------------------------
  capabilityChoices: null,
  initCapability: function() {
    var choices = this.get('store').getById('schema','container').get('resourceFields.capAdd').options.sort();
    this.set('capabilityChoices',choices);
    this.set('instance.capAdd',[]);
    this.set('instance.capDrop',[]);
  },

  // ----------------------------------
  // Memory
  // ----------------------------------
  memoryMb: null,
  memoryDidChange: function() {
    // The actual parameter we're interested in is 'memorySwap', in bytes.
    var mem = parseInt(this.get('memoryMb'),10);
    if ( isNaN(mem) )
    {
      this.set('memoryMb','');
      this.set('instance.memorySwap',null);
    }
    else
    {
      this.set('instance.memorySwap', mem * 1024 * 1024);
    }
  }.observes('memoryMb'),

  // ----------------------------------
  // Hosts
  // ----------------------------------
  hostChoices: function() {
    var list = this.get('allHosts').map((host) => {
      var hostLabel = (host.get('name') || '('+host.get('id')+')');
      if ( host.get('state') !== 'active' )
      {
        hostLabel += ' (' + host.get('state') + ')';
      }

      return {
        id: host.get('id'),
        name: hostLabel,
      };
    });

    return list.sortBy('name','id');
  }.property('allHosts.@each.{id,name,state}'),

  // ----------------------------------
  // Terminal
  // ----------------------------------
  terminal: null, //'both',
  terminalDidChange: function() {
    var val = this.get('terminal');
    var stdinOpen = ( val === 'interactive' || val === 'both' );
    var tty = (val === 'terminal' || val === 'both');
    this.set('instance.tty', tty);
    this.set('instance.stdinOpen', stdinOpen);
  }.observes('terminal'),

  // ----------------------------------
  // Devices
  // ----------------------------------
  devicesArray: null,
  initDevices: function() {
    this.set('instance.devices', []);
    this.set('devicesArray', []);
  },
  devicesDidChange: function() {
    var out = this.get('instance.devices');
    out.beginPropertyChanges();
    out.clear();
    this.get('devicesArray').forEach(function(row) {
      if ( row.host )
      {
        out.push(row.host+":"+row.container+":"+row.permissions);
      }
    });
    out.endPropertyChanges();
  }.observes('devicesArray.@each.{host,container,permissions}'),

  // ----------------------------------
  // Entry Point
  // ----------------------------------
  strEntryPoint: '',
  strEntryPointDidChange: function() {
    var out = ShellQuote.parse(this.get('strEntryPoint').trim()||'');
    if ( out.length )
    {
      this.set('instance.entryPoint', out);
    }
    else
    {
      this.set('instance.entryPoint', null);
    }
  }.observes('strEntryPoint'),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave: function() {
    if ( !this.get('editing') )
    {
      // 'ports' and 'instanceLinks' need to be strings for create
      this.set('instance.ports', this.get('portsAsStrArray'));
      this.set('instance.instanceLinks', this.get('linksAsMap'));
    }

    return this._super();
  },

  doneSaving: function() {
    var out = this._super();
    this.send('goToPrevious');
    return out;
  },
});
