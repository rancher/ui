import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ShellQuote from 'npm:shell-quote';
import Util from 'ui/utils/util';
import EditHealthCheck from 'ui/mixins/edit-healthcheck';
import EditLabels from 'ui/mixins/edit-labels';

export default Ember.Mixin.create(NewOrEdit, EditHealthCheck, EditLabels, {
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
      this.get('linksArray').pushObject({name: '', targetInstanceId: null});
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

    addVolumeFromService: function() {
      this.get('volumesFromServiceArray').pushObject({value: ''});
    },
    removeVolumeFromService: function(obj) {
      this.get('volumesFromServiceArray').removeObject(obj);
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

    pastedEnviromentVars: function(str, target) {
      var ary = this.get('environmentArray');
      str = str.trim();
      if ( str.indexOf('=') === -1 )
      {
        // Just pasting a key
        $(target).val(str);
        return;
      }

      var lines = str.split(/\r?\n/);
      lines.forEach((line) => {
        line = line.trim();
        if ( !line )
        {
          return;
        }

        var idx = line.indexOf('=');
        var key = '';
        var val = '';
        if ( idx > 0 )
        {
          key = line.substr(0,idx).trim();
          val = line.substr(idx+1).trim();
        }
        else
        {
          key = line.trim();
          val = '';
        }

        var existing = ary.filterProperty('key',key)[0];
        if ( existing )
        {
          Ember.set(existing,'value',val);
        }
        else
        {
          ary.pushObject({key: key, value: val});
        }
      });

      ary.forEach((item) => {
        if ( !item.key && !item.value )
        {
          ary.removeObject(item);
        }
      });
    },

    addSchedulingRule: function() {
      this.send('addSystemLabel','','','affinity');
    },

    removeSchedulingRule: function(obj) {
      this.send('removeLabel', obj);
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
      this.initVolumes();
      this.initVolumesFrom();
      this.initDns();
      this.initDnsSearch();
      this.initCapability();
      this.initDevices();
      this.initUuid();
      this.initTerminal();
      this.initRestart();
      this.initCommand();
      this.initEntryPoint();
      this.initMemory();
      this.initHealthCheck();
      this.initScheduling();
    }
  },

  // ----------------------------------
  // Image
  // ----------------------------------
  userImageUuid: 'ubuntu:14.04.2',
  initUuid: function() {
    if ( this.get('instance.imageUuid') )
    {
      this.set('userImageUuid', (this.get('instance.imageUuid')||'').replace(/^docker:/,''));
    }
    this.userImageUuidDidChange();
  },
  userImageUuidDidChange: function() {
    var input = (this.get('userImageUuid')||'').trim();
    var uuid = 'docker:';

    // Look for a redundant docker: pasted in
    if ( input.indexOf(uuid) === 0 )
    {
      //this.set('userImageUuid', input.substr(uuid.length));
      //return;
      uuid = input;
      this.set('instance.imageUuid', input);
    }
    else if ( input && input.length )
    {
      this.set('instance.imageUuid', uuid+input);
    }
    else
    {
      this.set('instance.imageUuid', null);
    }
  }.observes('userImageUuid'),


  // ----------------------------------
  // Restart
  // ----------------------------------
  restart: null, //'no',
  restartLimit: null, //5,

  initRestart: function() {
    var name = this.get('instance.restartPolicy.name');
    var count = this.get('instance.restartPolicy.maximumRetryCount');
    if ( name === 'on-failure' && count !== undefined )
    {
      this.setProperties({
        'restart': 'on-failure-cond',
        'restartLimit': parseInt(count, 10),
      });
    }
    else
    {
      this.set('restartLimit',5);
      this.set('restart', name || 'no');
    }
  },

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
  networkChoices: null,
  isManagedNetwork: Ember.computed.equal('instance.networkMode','managed'),
  isContainerNetwork: Ember.computed.equal('instance.networkMode','container'),
  initNetwork: function() {
    var isService = this.get('isService')||false;
    var choices = this.get('store').getById('schema','container').get('resourceFields.networkMode').options.sort();
    var out = [];
    choices.forEach((option) => {
      if ( isService && option === 'container' )
      {
        return;
      }

      out.push({label: Util.ucFirst(option), value: option});
    });

    this.set('networkChoices', out);
  },

  networkModeChanged: function() {
    if ( this.get('instance.networkMode') !== 'container' )
    {
      this.set('instance.networkContainerId', null);
    }
  }.observes('instance.networkMode'),

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
          hostId: host.get('id'),
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
          hostId: null,
          id: id,
          name: (container && container.get('name') ? container.get('name') : '('+id+')')
        };
      });
    }

    return list.sortBy('group','name','id');
  }.property('allHosts.@each.instancesUpdated').volatile(),

  containersOnRequestedHost: function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');

    if ( requestedHostId )
    {
      return all.filterProperty('hostId', requestedHostId);
    }
    else
    {
      return all;
    }
  }.property('containerChoices.@each.hostId','instance.requestedHostId'),

  containersOnRequestedHostIfUnmanaged: function() {
    var requestedHostId = this.get('instance.requestedHostId');
    var all = this.get('containerChoices');
    var isManagedNetwork = this.get('isManagedNetwork');

    if ( requestedHostId && !isManagedNetwork )
    {
      return all.filterProperty('hostId', requestedHostId);
    }
    else
    {
      return all;
    }
  }.property('containerChoices.@each.hostId','instance.requestedHostId','isManagedNetwork'),

  linksArray: null,
  initLinks: function() {
    var out = [];
    var links = this.get('instanceLinks')||[];

    if ( Ember.isArray(links) )
    {
      links.forEach(function(value) {
        // Objects, from edit
        if ( typeof value === 'object' )
        {
          out.push({
            existing: (value.id ? true : false),
            obj: value,
            name: value.name,
            targetInstanceId: value.targetInstanceId,
          });
        }
        else
        {
          // Strings, from create maybe
          var match = value.match(/^([^:]+):(.*)$/);
          if ( match )
          {
            out.push({name: match[1], targetInstanceId: match[2], existing: false});
          }
        }
      });
    }

    this.set('linksArray', out);
  },

  // ----------------------------------
  // Environment Vars
  // ----------------------------------
  environmentArray: null,
  initEnvironment: function() {
    var obj = this.get('instance.environment')||{};
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

    var ports = this.get('ports');
    if ( ports )
    {
      // Objects, from edit
      ports.forEach(function(value) {
        out.push({
          existing: (value.id ? true : false),
          obj: value,
          public: value.publicPort,
          private: value.privatePort,
          protocol: value.protocol,
        });
      });
    }
    else
    {
      ports = this.get('instance.ports')||[];
      ports.forEach(function(value) {
        if ( typeof value === 'object' )
        {
          // Objects, from clone
          out.push({
            existing: false,
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
    }

    this.set('portsArray', out);
  },

  // ----------------------------------
  // Volumes
  // ----------------------------------
  volumesArray: null,
  initVolumes: function() {
    var ary = this.get('instance.dataVolumes');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dataVolumes',ary);
    }

    this.set('volumesArray', ary.map(function(vol) {
      return {value: vol};
    }));
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
  }.property('instance.requestedHostId','allHosts.@each.instancesUpdated'),

  volumesFromArray: null,
  initVolumesFrom: function() {
    var ary = this.get('instance.dataVolumesFrom');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dataVolumesFrom',ary);
    }

    this.set('volumesFromArray', ary.map(function(vol) {
      return {value: vol};
    }));
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
    var ary = this.get('instance.dns');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dns',ary);
    }

    this.set('dnsArray', ary.map(function(entry) {
      return {value: entry};
    }));
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
    var ary = this.get('instance.dnsSearch');
    if ( !ary )
    {
      ary = [];
      this.set('instance.dnsSearch',ary);
    }

    this.set('dnsSearchArray', ary.map(function(entry) {
      return {value: entry};
    }));
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
    this.set('instance.capAdd', this.get('instance.capAdd') || []);
    this.set('instance.capDrop', this.get('instance.capDrop') || []);
    var choices = this.get('store').getById('schema','container').get('resourceFields.capAdd').options.sort();
    this.set('capabilityChoices',choices);
  },

  // ----------------------------------
  // Memory
  // ----------------------------------
  memoryMb: null,
  initMemory: function() {
    var b = this.get('instance.memorySwap');
    if ( b )
    {
      this.set('memoryMb', parseInt(b,10)/(1024*1024));
    }
    else
    {
      this.set('memoryMb',null);
    }

  },
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
  initTerminal: function() {
    var instance = this.get('instance');
    var tty = instance.get('tty');
    var stdin = instance.get('stdinOpen');
    var out = 'both';

    if ( tty !== undefined || stdin !== undefined )
    {
      if ( tty && stdin )
      {
        out = 'both';
      }
      else if ( tty )
      {
        out = 'terminal';
      }
      else if ( stdin )
      {
        out = 'interactive';
      }
      else
      {
        out = 'none';
      }
    }

    this.set('terminal', out);
    this.terminalDidChange();
  },
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
    var ary = this.get('instance.devices');
    if ( !ary )
    {
      ary = [];
      this.set('instance.devices',ary);
    }

    this.set('devicesArray', ary.map(function(dev) {
      var parts = dev.split(':');
      return {host: parts[0], container: parts[1], permissions: parts[2]};
    }));
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
  // Command
  // ----------------------------------
  strCommand: '',
  initCommand: function() {
    var ary = this.get('instance.command');
    if ( ary )
    {
      this.set('strCommand', ShellQuote.quote(ary));
    }
    else
    {
      this.set('strCommand','');
    }
  },
  strCommandDidChange: function() {
    var str = this.get('strCommand').trim()||'';
    // @TODO remove after v0.18
    if ( this.get('store').getById('schema','container').get('resourceFields.command.type') === 'string' )
    {
      this.set('instance.command', str);
    }
    else
    {
      var out = ShellQuote.parse(str).map(function(piece) {
        if ( typeof piece === 'object' && piece && piece.op )
        {
          return piece.op;
        }
        else
        {
          return piece;
        }
      });
      if ( out.length )
      {
        this.set('instance.command', out);
      }
      else
      {
        this.set('instance.command', null);
      }
    }
  }.observes('strCommand'),

  // ----------------------------------
  // Entry Point
  // ----------------------------------
  strEntryPoint: '',
  initEntryPoint: function() {
    var ary = this.get('instance.entryPoint');
    if ( ary )
    {
      this.set('strEntryPoint', ShellQuote.quote(ary));
    }
    else
    {
      this.set('strEntryPoint','');
    }
  },
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
  // Scheduling
  // ----------------------------------
  initScheduling: function() {
    if ( this.get('instance.requestedHostId') )
    {
      this.set('isRequestedHost',true);
    }
    else
    {
      this.set('isRequestedHost',false);
    }

    // @TODO import existing for clone
  },

  isRequestedHost: null,
  isRequestedHostDidChange: function() {
    if ( this.get('isRequestedHost') )
    {
      if ( !this.get('instance.requestedHostId') )
      {
        this.set('instance.requestedHostId', this.get('hostChoices.firstObject.id'));
      }
    }
    else
    {
      this.set('instance.requestedHostId', null);
    }
  }.observes('isRequestedHost'),

  // ----------------------------------
  // Save
  // ----------------------------------
  willSave: function() {
    if ( !this.get('editing') )
    {
      // 'ports' and 'instanceLinks' need to be strings for create
      this.set('instance.ports', this.get('portsAsStrArray'));

      var linksAsMap = {};
      this.get('linksArray').forEach((row) => {
        if ( row.targetInstanceId )
        {
          var name = row.name;
          // Lookup the container name if an "as name" wasn't given
          if ( !name )
          {
            var container = this.get('hostContainerChoices').filter('id', row.targetInstanceId)[0];
            if ( container )
            {
              name = container.get('name');
            }
          }

          if ( name )
          {
            linksAsMap[ name ] = row.targetInstanceId;
          }
        }
      });
      this.set('instance.instanceLinks', linksAsMap);

      var healthCheck = this.get('healthCheck');
      if ( healthCheck.get('port') )
      {
        this.set('instance.healthCheck', healthCheck);
      }
      else
      {
        this.set('instance.healthCheck', null);
      }
    }

    return this._super();
  },
});
