import Ember from 'ember';
import C from 'ui/utils/constants';
import ManageLabels from 'ui/mixins/manage-labels';

export default Ember.Component.extend(ManageLabels, {
  // Inputs
  instance: null,
  errors: null,
  isService: null,

  tagName: '',

  didInitAttrs() {
    this.initLabels(this.get('initialLabels'), null, C.LABEL.START_ONCE);
    this.initTerminal();
    this.initStartOnce();
    this.initRestart();
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
  // Start Once
  // ----------------------------------
  startOnce: null,
  initStartOnce: function() {
    var startOnce = this.getLabel(C.LABEL.START_ONCE) === 'true';
    this.set('startOnce', startOnce);
  },

  startOnceDidChange: function() {
    if ( this.get('startOnce') )
    {
      this.setLabel(C.LABEL.START_ONCE, 'true');
    }
    else
    {
      this.removeLabel(C.LABEL.START_ONCE);
    }
  }.observes('startOnce'),


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
});
