import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

const STOP_TIMEOUT = 10;
const STOP_SIGNALS = [
  {
    label: 'formCommand.stopSignal.sigup',
    value: 'SIGUP',
  },
  {
    label: 'formCommand.stopSignal.sigint',
    value: 'SIGINT',
  },
  {
    label: 'formCommand.stopSignal.sigquit',
    value: 'SIGQUIT',
  },
  {
    label: 'formCommand.stopSignal.sigkill',
    value: 'SIGKILL',
  },
  {
    label: 'formCommand.stopSignal.sigusr1',
    value: 'SIGUSR1',
  },
  {
    label: 'formCommand.stopSignal.sigusr2',
    value: 'SIGUSR2',
  },
  {
    label: 'formCommand.stopSignal.sigterm',
    value: 'SIGTERM',
  },
  {
    label: 'formCommand.stopSignal.custom.label',
    value: 'custom',
  },
];
const LOG_DRIVERS = [
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
];

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  instance:           null,
  errors:             null,
  editing:            true,
  defaultStopTimeout: STOP_TIMEOUT,
  stopSignals:        STOP_SIGNALS,
  customStopSet:      false,

  intl: Ember.inject.service(),

  init() {
    this._super(...arguments);
    this.initLabels(this.get('initialLabels'), null, C.LABEL.START_ONCE);
    this.initTerminal();
    this.initRestart();
    this.initLogging();
  },

  actions: {
    setLogOptions(map) {
      if ( this.get('instance.logConfig') ) {
        this.set('instance.logConfig.config', map);
      }
    }
  },

  updateLabels(labels) {
    this.sendAction('setLabels', labels);
  },

  // ----------------------------------
  // Terminal
  // ----------------------------------
  terminal: null, //'both',
  initTerminal: function() {
    var instance = this.get('instance');
    var tty = instance.get('tty');
    var stdin = instance.get('stdinOpen');
    var out = {
      type: 'both',
      name: this.get('intl').tHtml('formCommand.console.both'),
    };

    if ( tty !== undefined || stdin !== undefined )
    {
      if ( tty && stdin )
      {
        out.type = 'both';
        out.name = this.get('intl').tHtml('formCommand.console.both');
      }
      else if ( tty )
      {
        out.type = 'terminal';
        out.name = this.get('intl').tHtml('formCommand.console.terminal');
      }
      else if ( stdin )
      {
        out.type = 'interactive';
        out.name = this.get('intl').tHtml('formCommand.console.interactive');
      }
      else
      {
        out.type = 'none';
        out.name = this.get('intl').tHtml('formCommand.console.none');
      }
    }

    this.set('terminal', out);
    this.terminalDidChange();
  },

  terminalDidChange: function() {
    var val = this.get('terminal.type');
    var stdinOpen = ( val === 'interactive' || val === 'both' );
    var tty = (val === 'terminal' || val === 'both');
    this.set('instance.tty', tty);
    this.set('instance.stdinOpen', stdinOpen);
  }.observes('terminal.type'),

  // ----------------------------------
  // Deprecated Start Once
  // ----------------------------------
  initStartOnce: function() {
  },

  // ----------------------------------
  // Restart
  // ----------------------------------
  restart: null, //'no',
  restartLimit: null, //5,

  initRestart: function() {
    var name = this.get('instance.restartPolicy.name');
    var count = this.get('instance.restartPolicy.maximumRetryCount');

    // Convert deprecated start-once label to on-failure
    var startOnce = this.getLabel(C.LABEL.START_ONCE) === 'true';
    this.removeLabel(C.LABEL.START_ONCE);
    if ( startOnce ) {
      name = 'on-failure';
      count = undefined;
    }

    if ( name === 'on-failure' && count !== undefined )
    {
      this.setProperties({
        'restart': 'on-failure-cond',
        'restartLimit': parseInt(count, 10)+'',
      });
    }
    else
    {
      this.set('restartLimit','5');
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

  statusClass: null,
  status: function() {
    let k = STATUS.STANDARD;
    let inst = this.get('instance');

    if ( inst.get('command') || inst.get('entryPoint') || inst.get('workingDir') ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.CUSTOM;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('instance.{command,entryPoint,workingDir}','errors.length'),

  // ----------------------------------
  // Logging
  // ----------------------------------
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

  logDriverChoices: LOG_DRIVERS,

  stopOrCustom: Ember.computed({
    get(/* key */) {
      return this.get('instance.stopSignal');
    },
    set(key,value) {
      if (value === 'custom') {
        this.set('customStopSet', true);
        return this.set('instance.stopSignal', null);
      }
      if (this.get('customStopSet')) {
        this.set('customStopSet', false);
      }
      return this.set('instance.stopSignal', value);
    }
  }),

  hasLogConfig: Ember.computed('instance.logConfig.config', function() {
    return Ember.isEmpty(this.get('instance.logConfig.config'));
  }),

});
