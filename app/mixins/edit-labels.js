import Ember from 'ember';

export default Ember.Mixin.create({
  actions: {
    addLabel: function() {
      this.get('labelArray').pushObject({
        key: '',
        value: '',
      });
    },

    removeLabel: function(obj) {
      this.get('labelArray').removeObject(obj);
    },

    pastedLabels: function(str, target) {
      var ary = this.get('labelArray');
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
  },

  labelArray: null,

  initFields: function() {
    this._super();
    this.initLabels();
  },

  initLabels: function() {
    var obj = this.get('primaryResource.labels')||{};
    var keys = Object.keys(obj);
    var out = [];
    keys.forEach(function(key) {
      out.push({ key: key, value: obj[key] });
    });

    this.set('labelArray', out);
  },

  labelsChanged: function() {
    // Sync with the actual environment object
    var out = {};
    this.get('labelArray').forEach(function(row) {
      if ( row.key )
      {
        out[row.key] = row.value;
      }
    });
    this.set('primaryResource.labels', out);
  }.observes('labelArray.@each.{key,value}'),

});
