import Ember from 'ember';

// @@TODO@@ - Dec 8, 2015 - need to add callback to this service.

export default Ember.Component.extend({
  // Inputs
  initialMap: null,
  nameLabel: 'Pair',
  keyLabel: 'Key',
  valueLabel: 'Value',
  keyPlaceholder: 'Key',
  valuePlaceholder: 'Value',

  ary: null,
  asMap: null,

  actions: {
    add() {
      this.get('ary').pushObject(Ember.Object.create({key: '', value: ''}));
      Ember.run.next(() => {
        if ( this._state !== 'destroying' )
        {
        this.$('INPUT.key').last()[0].focus();
        }
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
    },

    pastedLabels(str, target) {
      var ary = this.get('ary');
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
          ary.pushObject(Ember.Object.create({key: key, value: val}));
        }
      });

      // Clean up empty user entries
      var toRemove = [];
      ary.forEach((item) => {
        if ( !item.get('key') && !item.get('value') )
        {
          toRemove.push(item);
        }
      });

      ary.removeObjects(toRemove);
    },
  },

  didInitAttrs() {
    var ary = [];
    var map = this.get('initialMap')||{};
    Object.keys(map).forEach((key) => {
      ary.push(Ember.Object.create({key: key, value: map[key]}));
    });

    this.set('ary', ary);
  },

  asMapObserver: function() {
    var out = {};
    this.get('ary').forEach((row) => {
      out[row.get('key').trim()] = row.get('value').trim();
    });

    this.set('asMap', out);
    this.sendAction('changed', out);
  }.observes('ary.@each.{key,value}'),
});
