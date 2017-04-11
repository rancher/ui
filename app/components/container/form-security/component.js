import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  projects: Ember.inject.service(),

  classNames: ['accordion-wrapper'],

  // Inputs
  instance: null,
  editing: true,

  pullImage: null,

  actions: {
    addDevice: function() {
      this.get('devicesArray').pushObject({host: '', container: '', permissions: 'rwm'});
    },

    removeDevice: function(obj) {
      this.get('devicesArray').removeObject(obj);
    },

    modifyCapabilities: function(type, select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      this.set(`instance.${type}`, selectedOptions);
    },
  },

  init() {
    this._super(...arguments);

    this.initLabels(this.get('initialLabels'), null, C.LABEL.PULL_IMAGE);

    var pull = this.getLabel(C.LABEL.PULL_IMAGE) === C.LABEL.PULL_IMAGE_VALUE;
    this.set('pullImage', pull);

    if ( !this.get('projects.current.isWindows') ) {
      this.initCapability();
      this.initDevices();
      this.initMemory();
      this.initPidMode();
    }
  },

  // ----------------------------------
  // Capability
  // ----------------------------------
  pullImageDidChange: function() {
    if ( this.get('pullImage') )
    {
      this.setLabel(C.LABEL.PULL_IMAGE, C.LABEL.PULL_IMAGE_VALUE);
    }
    else
    {
      this.removeLabel(C.LABEL.PULL_IMAGE, true);
    }
  }.observes('pullImage'),

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
  memoryReservationMb: null,
  swapMb: null,
  initMemory: function() {
    var memBytes = this.get('instance.memory') || 0;
    var memPlusSwapBytes = this.get('instance.memorySwap') || 0;
    var memReservation = this.get('instance.memoryReservation');
    var swapBytes = Math.max(0, memPlusSwapBytes - memBytes);

    if (memReservation) {
      this.set('memoryReservationMb', parseInt(memReservation,10)/1048576);
    } else {
      this.set('memoryReservationMb', '');
    }
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

  memoryReservationChanged: Ember.observer('memoryReservationMb', function() {
    var mem = this.get('memoryReservationMb');

    if ( isNaN(mem) || mem <= 0) {
      this.set('instance.memoryReservation', '');
    }
    else {
      this.set('instance.memoryReservation', mem * 1048576);
    }
  }),

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

  isolationChoices: function() {
    return [
      {label: 'formSecurity.isolation.default', value: 'default'},
      {label: 'formSecurity.isolation.hyperv', value: 'hyperv'},
    ];
  }.property(),
});
