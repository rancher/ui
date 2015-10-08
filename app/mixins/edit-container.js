import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { debouncedObserver } from 'ui/utils/debounce';

export default Ember.Mixin.create(NewOrEdit, {
  queryParams: ['tab','hostId','advanced'],
  tab: 'command',
  hostId: null,
  advanced: false,

  primaryResource: Ember.computed.alias('model.instance'),
  labelResource: Ember.computed.alias('model.instance'),

  // Errors from components
  commandErrors: null,
  volumeErrors: null,
  networkingErrors: null,
  healthCheckErrors: null,
  schedulingErrors: null,

  actions: {
    toggleAdvanced: function() {
      this.set('advanced', !this.get('advanced'));
    },

    addPort: function() {
      this.get('portsArray').pushObject({public: '', private: '', protocol: 'tcp'});
    },
    removePort: function(obj) {
      this.get('portsArray').removeObject(obj);
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

        var existing = ary.filterBy('key',key)[0];
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

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setRequestedHostId(hostId) {
      console.log('requestedHostId=',hostId);
      this.set('model.instance.requestedHostId', hostId);
    },
  },

  // ----------------------------------
  // Setup
  // ----------------------------------
  initFields: function() {
    this._super();
    this.initLabels();
    this.initPorts();

    if ( !this.get('editing') )
    {
      this.initCapability();
      this.initDevices();
      this.initUuid();
      this.initMemory();
      this.initPidMode();
    }
  },

  // ----------------------------------
  // Labels
  // ----------------------------------
  schedulingLabels: null,
  initLabels: function() {
    this.labelsChanged();
  },

  labelsChanged: debouncedObserver('schedulingLabels.@each.{key,value}',function() {
    var out = {};

    (this.get('schedulingLabels')||[]).forEach((row) => {
      out[row.key] = row.value;
    });

    if ( this.get('labelResource') )
    {
      console.log('set',out);
      this.set('labelResource.labels', out);
    }
  }),

  // ----------------------------------
  // Image
  // ----------------------------------
  userImageUuid: 'ubuntu:14.04.3',
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
  swapMb: null,
  initMemory: function() {
    var memBytes = this.get('instance.memory') || 0;
    var memPlusSwapBytes = this.get('instance.memorySwap') || 0;
    var swapBytes = Math.max(0, memPlusSwapBytes - memBytes);

    if ( memBytes )
    {
      this.set('memoryMb', parseInt(memBytes,10)/1048576);
    }
    else
    {
      this.set('memoryMb','');
    }

    if ( swapBytes )
    {
      this.set('swapMb', parseInt(swapBytes,10)/1048576);
    }
    else
    {
      this.set('swapMb','');
    }

  },

  memoryDidChange: function() {
    // The actual parameter we're interested in is 'memory', in bytes.
    var mem = parseInt(this.get('memoryMb'),10);
    if ( isNaN(mem) || mem <= 0)
    {
      this.setProperties({
        'memoryMb': '',
        'swapMb': '',
        'instance.memory': null,
        'instance.memorySwap': null,
      });
    }
    else
    {
      this.set('instance.memory', mem * 1048576);

      var swap = parseInt(this.get('swapMb'),10);
      if ( isNaN(swap) || swap <= 0)
      {
        this.setProperties({
          'swapMb': '',
          'instance.memorySwap': null
        });
      }
      else
      {
        this.set('instance.memorySwap', (mem+swap) * 1048576);
      }
    }
  }.observes('memoryMb','swapMb'),

  // ----------------------------------
  // PID Mode
  // ----------------------------------
  pidHost: null,
  initPidMode: function() {
    this.set('pidHost', this.get('instance.pidMode') === 'host');
  },
  pidModeDidChange: function() {
    this.set('instance.pidMode', this.get('pidHost') ? 'host' : null);
  }.observes('pidHost'),

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
  // Save
  // ----------------------------------
  willSave: function() {
    var errors = [];
    if ( !this.get('editing') )
    {
      // Errors from components
      errors.pushObjects(this.get('commandErrors')||[]);
      errors.pushObjects(this.get('volumeErrors')||[]);
      errors.pushObjects(this.get('networkingErrors')||[]);
      errors.pushObjects(this.get('healthCheckErrors')||[]);
      errors.pushObjects(this.get('schedulingErrors')||[]);

      if ( errors.length )
      {
        this.set('errors', errors);
        return false;
      }

      // 'ports' and 'instanceLinks' need to be strings for create
      this.set('instance.ports', this.get('portsAsStrArray'));
    }

    return this._super();
  },
});
