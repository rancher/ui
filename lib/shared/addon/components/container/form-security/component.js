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

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
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
  memoryMode: 'unlimited', // unlimited, set
  memoryMb: null,
  swapMode: 'default', // default, none, unlimited, set
  swappinessMode: 'default', // default, none, set
  swapMb: null,
  memoryReservationMb: null,
  initMemory: function() {
    var memBytes = this.get('instance.memory') || 0;
    var memPlusSwapBytes = this.get('instance.memorySwap') || 0;
    var swapBytes = Math.max(0, memPlusSwapBytes - memBytes);
    var memReservation = this.get('instance.memoryReservation');

    if (memReservation) {
      this.set('memoryReservationMb', parseInt(memReservation,10)/1048576);
    } else {
      this.set('memoryReservationMb', '');
    }

    if ( memBytes ) {
      this.set('memoryMb', parseInt(memBytes,10)/1048576);
      this.set('memoryMode', 'set');
    } else {
      this.set('memoryMb', 128);
      this.set('memoryMode', 'unlimited');
    }

    if ( swapBytes )
    {
      let bytes = parseInt(swapBytes,10);
      if ( memBytes && memBytes === swapBytes ) {
        this.set('swapMode', 'none');
        this.set('swapMb', 0);
      } else if ( bytes >= 0 ) {
        this.set('swapMode', 'set');
        this.set('swapMb', parseInt(swapBytes,10)/1048576);
      } else {
        this.set('swapMode', 'unlimited');
        this.set('swapMb', bytes);
      }
    }
    else
    {
      this.set('swapMode','default');
      if ( memBytes ) {
        this.set('swapMb', 2*memBytes);
      } else {
        this.set('swapMb', 256);
      }
    }

    var swappiness = this.get('instance.memorySwappiness');
    if ( swappiness ) {
     swappiness = parseInt(swappiness,10);
    }

    if ( this.get('swapMode') === 'none'  || swappiness === null || swappiness === undefined ) {
      this.set('instance.memorySwappiness', null);
      this.set('swappinessMode','default');
    } else if ( swappiness === 0 ) {
      this.set('instance.memorySwappiness', 0);
      this.set('swappinessMode', 'min');
    } else {
      this.set('instance.memorySwappiness', swappiness);
      this.set('swappinessMode', 'set');
    }

    this.updateMemory();
  },

  updateMemory: function() {
    // The actual parameter we're interested in is 'memory', in bytes.
    let mem = parseInt(this.get('memoryMb'),10);
    let swap = parseInt(this.get('swapMb'),10);
    let memoryMode = this.get('memoryMode');
    let swapMode = this.get('swapMode');
    let swappinessMode = this.get('swappinessMode');
    let swappiness = this.get('swappiness');

    // Swappiness
    if ( swappinessMode === 'default' ) {
      this.set('instance.memorySwappiness', null);
    } else if ( swappinessMode === 'min' ) {
      this.set('instance.memorySwappiness', 0);
    } else {
      if ( swappiness ) {
        swappiness = parseInt(swappiness,10);
      }

      if ( isNaN(swappiness) || !swappiness ) {
        swappiness = 50;
        this.set('swappiness', swappiness);
        return; // We'll be back
      }

      this.set('instance.memorySwappiness', swappiness);
    }

    // Memory
    if ( memoryMode === 'unlimited' || isNaN(mem) || mem <= 0) {
      this.setProperties({
        'instance.memory': null,
        'instance.memorySwap': null,
        'swapMode': 'unlimited',
      });
      return;
    }

    this.set('instance.memory', mem * 1048576);

    // Swap
    switch (swapMode) {
      case 'default':
        this.set('instance.memorySwap', null);
        this.set('swapMb', 2*mem);
        break;
      case 'unlimited':
        this.set('instance.memorySwap', -1);
        break;
      case 'none':
        this.set('instance.memorySwap', mem*1048576);
        break;
      case 'set':
        this.set('instance.memorySwap', (mem+swap)*1048576);
        break;
    }
  },

  memoryDidChange: function() {
    Ember.run.next(this,'updateMemory');
  }.observes('memoryMb','memoryMode','swapMb','swapMode','swappinessMode','swappiness'),

  memoryReservationChanged: Ember.observer('memoryReservationMb', function() {
    var mem = this.get('memoryReservationMb');

    if ( isNaN(mem) || mem <= 0) {
      this.set('instance.memoryReservation', null);
    } else {
      this.set('instance.memoryReservation', mem * 1048576);
    }
  }),


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
