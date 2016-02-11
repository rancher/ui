import Ember from 'ember';
import ShellQuote from 'npm:shell-quote';

export default Ember.Component.extend({
  // Inputs
  model: null,

  tagName: '',

  didInitAttrs() {
    this.initCommand();
    this.initEntryPoint();
    this.initEnvironment();
  },

  actions: {
    envChanged(map) {
      var ary = [];
      Object.keys(map).forEach((key) => {
        ary.push({name: key, value: map[key]});
      });

      this.set('model.env', ary);
    },
  },

  // ----------------------------------
  // Docker/Rancher Command (K8S args)
  // ----------------------------------
  strCommand: '',
  initCommand: function() {
    var ary = this.get('model.args');
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
      this.set('model.args', out);
    }
    else
    {
      this.set('model.args', null);
    }
  }.observes('strCommand'),

  // ----------------------------------
  // Docker/Rancher Entry Point (K8S command)
  // ----------------------------------
  strEntryPoint: '',
  initEntryPoint: function() {
    var ary = this.get('model.command');
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
      this.set('model.command', out);
    }
    else
    {
      this.set('model.command', null);
    }
  }.observes('strEntryPoint'),


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
