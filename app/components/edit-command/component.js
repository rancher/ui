import Ember from 'ember';
import ShellQuote from 'npm:shell-quote';

export default Ember.Component.extend({
  instance: null,
  errors: null,

  didInitAttrs() {
    this.initCommand();
    this.initEntryPoint();
    this.initTerminal();
    this.initRestart();
    this.initEnvironment();
  },

  actions: {
    addEnvironment: function() {
      this.get('environmentArray').pushObject({key: '', value: ''});
    },
    removeEnvironment: function(obj) {
      this.get('environmentArray').removeObject(obj);
    },
  },

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
});
