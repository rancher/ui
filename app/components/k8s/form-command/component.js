import Ember from 'ember';

export default Ember.Component.extend({
  // Inputs
  model: null,

  tagName: '',

  didInitAttrs() {
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
