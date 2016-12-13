import Ember from 'ember';

export default Ember.Component.extend({
  projects: Ember.inject.service(),

  // Inputs
  instance: null,
  classNameBindings: ['editing:component-editing:component-static'],
  editing: true,

  actions: {
    addDevice: function() {
      this.get('devicesArray').pushObject({host: '', container: '', permissions: 'rwm'});
    },

    removeDevice: function(obj) {
      this.get('devicesArray').removeObject(obj);
    },

    setLogDriver: function(driver) {
      this.set('instance.logConfig.driver', driver);
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

    if ( this.get('projects.current.isWindows') ) {
    } else {
      this.initCapability();
      this.initDevices();
      this.initMemory();
      this.initPidMode();
    }

    this.initLogging();
  },

  didInsertElement() {
    if ( ! this.get('projects.current.isWindows') ) {
      this.initMultiselect();
      this.privilegedDidChange();
    }
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

  initMultiselect: function() {
    var view = this;

    var opts = {
      maxHeight: 200,
      buttonClass: 'btn btn-default',
      buttonWidth: '100%',

      templates: {
        li: '<li><a tabindex="0"><label></label></a></li>',
      },

      buttonText: function(options, select) {
        var label = (select.hasClass('select-cap-add') ? 'Add' : 'Drop') + ": ";
        if ( options.length === 0 )
        {
          label += 'None';
        }
        else if ( options.length === 1 )
        {
          label += $(options[0]).text();
        }
        else
        {
          label += options.length + ' Selected';
        }

        return label;
      },

      onChange: function(/*option, checked*/) {
        var self = this;
        var options = $('option', this.$select);
        var selectedOptions = this.getSelected();
        var allOption = $('option[value="ALL"]',this.$select)[0];

        var isAll = $.inArray(allOption, selectedOptions) >= 0;

        if ( isAll )
        {
          options.each(function(k, option) {
            var $option = $(option);
            if ( option !== allOption )
            {
              self.deselect($(option).val());
              $option.prop('disabled',true);
              $option.parent('li').addClass('disabled');
            }
          });

          // @TODO Figure out why deslect()/select() doesn't fix the state in the ember object and remove this hackery...
          var ary = view.get('instance.' + (this.$select.hasClass('select-cap-add') ? 'capAdd' : 'capDrop'));
          ary.clear();
          ary.pushObject('ALL');
        }
        else
        {
          options.each(function(k, option) {
            var $option = $(option);
            $option.prop('disabled',false);
            $option.parent('li').removeClass('disabled');
          });
        }

        this.$select.multiselect('refresh');
      }
    };

    this.$('.select-cap-add').multiselect(opts);
    this.$('.select-cap-drop').multiselect(opts);
  },

  privilegedDidChange: function() {
    var add = this.$('.select-cap-add');
    var drop = this.$('.select-cap-drop');
    if ( add && drop )
    {
      if ( this.get('instance.privileged') )
      {
        add.multiselect('disable');
        drop.multiselect('disable');
      }
      else
      {
        add.multiselect('enable');
        drop.multiselect('enable');
      }
    }
  }.observes('instance.privileged'),

  initLogging: function() {
    if (!this.get('instance.logConfig') ) {
      this.set('instance.logConfig', {});
    }

    if (!this.get('instance.logConfig.driver') ) {
      this.set('instance.logConfig.driver', '');
    }

    if (!this.get('instance.logConfig.config') ) {
      this.set('instance.logConfig.config', {});
    }
  },

  logDriverChoices: [
    'none',
    'json-file',
    'awslogs',
    'etwlogs',
    'fluentd',
    'gcplogs',
    'gelf',
    'journald',
    'splunk',
    'syslog',
  ],

  hasLogConfig: Ember.computed('instance.logConfig.config', function() {
    return Ember.isEmpty(this.get('instance.logConfig.config'));
  }),

  isolationChoices: function() {
    return [
      {label: 'formSecurity.isolation.default', value: 'default'},
      {label: 'formSecurity.isolation.hyperv', value: 'hyperv'},
    ];
  }.property(),
});
