import Ember from 'ember';
import NewOrEditContainer from 'ui/pods/container/edit/new-or-edit';

export default Ember.ObjectController.extend(NewOrEditContainer, {
  queryParams: ['tab','hostId','advanced'],
  tab: 'command',
  hostId: null,
  advanced: false,
  editing: false,
  saving: false,
  originalModel: null,
  memoryMb: null,

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

    addLxc: function() {
      this.get('lxcArray').pushObject({key: '', value: ''});
    },
    removeLxc: function(obj) {
      this.get('lxcArray').removeObject(obj);
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
          this.set('credentialChoices', choice.get('credentials'));
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

      this.set('registryCredentialId', this.get('credentialChoices.firstObject.id'));
    },
  },

  validate: function() {
    // Workaround for 'ports' and 'instanceLinks' needing to be strings for create
    this.set('ports', this.get('portsAsStrArray'));
    this.set('instanceLinks', this.get('linksAsStrArray'));
    return true;
  },

  initFields: function() {
    this.initNetwork();
    this.initEnvironment();
    this.initPorts();
    this.initLinks();
    this.initVolumes();
    this.initVolumesFrom();
    this.initDns();
    this.initDnsSearch();
    this.initCapability();
    this.initLxc();
    this.initDevices();
    this.userImageUuidDidChange();
    this.terminalDidChange();
    this.restartDidChange();
  },

  // Restart
  restart: 'no',
  restartLimit: 5,

  restartDidChange: function() {
    var policy = {};
    var name = this.get('restart');
    var limit = parseInt(this.get('restartLimit'),10);

    if ( policy === 'on-failure-cond' )
    {
      name = 'on-failure';
      if ( limit > 0 )
      {
        policy.maximumRetryCount = limit;
      }
    }

    policy.name = name;
    this.set('restartPolicy', policy);
  }.observes('restart','restartLimit'),

  restartLimitDidChange: function() {
    this.set('restart', 'on-failure-cond');
  }.observes('restartLimit'),

  // Network
  networkChoices: null,
  networkId: null,
  initNetwork: function() {
    //this.set('networkChoices', this.get('store').all('network'));
    var networkIds = this.get('networkIds');
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
    var ary = this.get('networkIds')||[];
    ary.length = 0;
    ary.push(this.get('networkId'));
  }.observes('networkId'),

  // Environment Vars
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
    this.set('environment', out);
  }.observes('environmentArray.@each.{key,value}'),

  // Ports
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

  // Links
  linksAsStrArray: null,
  linksDidChange: function() {
    // Sync with the actual environment
    var out = {};
    this.get('linksArray').forEach(function(row) {
      if ( row.linkName && row.targetInstanceId )
      {
        out[ row.linkName ] = row.targetInstanceId;
      }
    });

    this.set('linksAsStrArray', out);
  }.observes('linksArray.@each.{linkName,targetInstanceId}'),

  // Image
  registryChoices: null,
  displayPrefix: 'docker:',
  userImageUuid: 'ubuntu:14.04.1',
  credentialChoices: null,
  showCredentials: Ember.computed.gt('credentialChoices.length',1),
  userImageUuidDidChange: function() {
    var input = this.get('userImageUuid');
    var choices = this.get('registryChoices')||[];

    // Look for a private registry with the matching prefix
    var prefix, choice, found=false;
    for ( var i = 0 ; i < choices.get('length') ; i++ )
    {
      choice = choices.objectAt(i);
      prefix = choice.get('serverAddress')+':';
      choice.set('selected', false);
      if ( input.indexOf(prefix) === 0 )
      {
        this.set('userImageUuid', input.substr(prefix.length));
        this.send('chooseRegistry', choice);
      }
    }

    if ( found )
    {
      return;
    }

    prefix = 'docker:';
    if ( input.indexOf(prefix) === 0 )
    {
      this.set('userImageUuid', input.substr(prefix.length));
      this.send('chooseRegistry', null);
    }
  }.observes('userImageUuid'),

  updateImageUuid: function() {
    var uuid = 'docker:';
    var registry = this.get('selectedRegistry.serverAddress');
    if ( registry )
    {
      uuid += registry + '/';
    }
    uuid += this.get('userImageUuid');

    this.set('imageUuid', uuid);
  }.observes('selectedRegistry.serverAddress','userImageUuid'),

  credentialChoicesChanged: function() {
    var found = false;
    var id = this.get('registryCredentialId');
    (this.get('credentialChoices')||[]).forEach((choice) => {
      if ( choice.get('id') === id )
      {
        found = true;
      }
    });

    if ( !found )
    {
      this.set('registryCredentialId',null);
    }
  }.observes('credentialChoices.@each.id','registryCredentialId'),

  // Volumes
  volumesArray: null,
  initVolumes: function() {
    this.set('dataVolumes', []);
    this.set('volumesArray', []);
  },

  volumesDidChange: function() {
    var out = this.get('dataVolumes');
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

  // Volumes From
  hostContainerChoices: function() {
    var list = [];

    this.get('allHosts').filter((host) => {
      return host.get('id') === this.get('requestedHostId');
    }).map((host) => {
      var containers = (host.get('instances')||[]).filter(function(instance) {
        // You can't mount volumes from other types of instances
        return instance.get('type') === 'container';
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

  volumesFromArray: null,
  initVolumesFrom: function() {
    this.set('dataVolumesFrom', []);
    this.set('volumesFromArray', []);
  },

  volumesFromDidChange: function() {
    var out = this.get('dataVolumesFrom');
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

  // DNS
  dnsArray: null,
  initDns: function() {
    this.set('dns', []);
    this.set('dnsArray', []);
  },

  dnsDidChange: function() {
    var out = this.get('dns');
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

  // DNS Search
  dnsSearchArray: null,
  initDnsSearch: function() {
    this.set('dnsSearch', []);
    this.set('dnsSearchArray', []);
  },
  dnsSearchDidChange: function() {
    var out = this.get('dnsSearch');
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

  // Capability
  capabilityChoices: null,
  initCapability: function() {
    var choices = this.get('store').getById('schema','container').get('resourceFields.capAdd').options.sort();
    this.set('capabilityChoices',choices);
    this.set('capAdd',[]);
    this.set('capDrop',[]);
  },

  // Memory
  memoryDidChange: function() {
    // The actual parameter we're interested in is 'memorySwap', in bytes.
    var mem = parseInt(this.get('memoryMb'),10);
    if ( isNaN(mem) )
    {
      this.set('memoryMb','');
      this.set('memorySwap',null);
    }
    else
    {
      this.set('memorySwap', mem * 1024 * 1024);
    }
  }.observes('memoryMb'),

  // Terminal
  terminal: 'both',
  terminalDidChange: function() {
    var val = this.get('terminal');
    var stdinOpen = ( val === 'interactive' || val === 'both' );
    var tty = (val === 'terminal' || val === 'both');
    this.set('tty', tty);
    this.set('stdinOpen', stdinOpen);
  }.observes('terminal'),

  // LXC Config
  lxcArray: null,
  initLxc: function() {
    var obj = this.get('lxcConf')||{};
    var keys = Object.keys(obj);
    var out = [];
    keys.forEach(function(key) {
      out.push({ key: key, value: obj[key] });
    });

    this.set('lxcArray', out);
  },

  lxcChanged: function() {
    // Sync with the actual environment object
    var out = {};
    this.get('lxcArray').forEach(function(row) {
      if ( row.key )
      {
        out[row.key] = row.value;
      }
    });
    this.set('lxcConf', out);
  }.observes('lxcArray.@each.{key,value}'),

  // Devices
  devicesArray: null,
  initDevices: function() {
    this.set('devices', []);
    this.set('devicesArray', []);
  },
  devicesDidChange: function() {
    var out = this.get('devices');
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

});
