import Ember from 'ember';
import NewOrEditContainer from 'ui/pods/container/edit/new-or-edit';

export default Ember.ObjectController.extend(NewOrEditContainer, {
  queryParams: ['tab','hostId'],
  tab: 'basic',
  hostId: null,
  editing: false,
  saving: false,
  originalModel: null,
  memoryMb: null,

  actions: {
    addArgument: function() {
      this.get('argsArray').pushObject({value: ''});
    },
    removeArg: function(obj) {
      this.get('argsArray').removeObject(obj);
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
    this.initArgs();
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

  // Command Arguments
  argsArray: null,
  initArgs: function() {
    var out = [];
    var args = this.get('commandArgs')||[];
    args.forEach(function(value) {
      out.push({value: value});
    });

    this.set('argsArray', out);
  },

  argsChanged: function() {
    // Sync with the actual environment
    var out = [];
    var ary = this.get('argsArray');
    ary.forEach(function(row) {
      if ( row.value )
      {
        out.push(row.value);
      }
    });

    this.set('commandArgs', out);
  }.observes('argsArray.@each.value'),

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
  userImageUuid: 'ubuntu:14.04.1',
  userImageUuidDidChange: function() {
    var image = this.get('userImageUuid');
    if ( image.indexOf('docker:') === 0 )
    {
      this.set('userImageUuid', image.replace(/^docker:/,''));
    }
    else
    {
      image = 'docker:' + image;
    }

    this.set('imageUuid', image);
  }.observes('userImageUuid'),

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
    var self = this;
    var list = [];

    this.get('controllers.hosts').forEach(function(host) {
      // You can only mount volumes from the host the container will go on
      if ( host.get('id') === self.get('requestedHostId'))
      {
        var containers = (host.get('instances')||[]).filter(function(instance) {
          // You can't mount volumes from other types of instances
          return instance.get('type') === 'container';
        });

        list.pushObjects(containers.map(function(container) {
          return {
            group: host.get('displayName'),
            id: container.get('id'),
            name: container.get('name')
          };
        }));
      }
    });

    return list.sortBy('group','container.name','container.id');
  }.property('controllers.hosts.@each.[]','controllers.hosts.@each.instancesUpdated').volatile(),

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
  terminalChoices: [
    {label: 'Yes (-i and -t)', value: 'both'},
    {label: 'Interactive (-i)', value: 'interactive'},
    {label: 'TTY (-t)', value: 'terminal'},
    {label: 'No', value: 'none'},
  ],
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
