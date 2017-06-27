import Ember from 'ember';

function applyLinesIntoArray(lines, ary) {
  lines.forEach((line) => {
    line = line.trim();
    if ( !line )
    {
      return;
    }

    var idx = line.indexOf('=');
    if ( idx === -1 ) {
      idx = line.indexOf(': ');
    }

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
}

function removeEmptyEntries(ary, allowEmptyValue=false) {
  // Clean up empty user entries
  var toRemove = [];
  ary.forEach((item) => {
    if ( item.get('key') && (item.get('value') || allowEmptyValue) )
    {
      // ok
    }
    else
    {
      toRemove.push(item);
    }
  });

  ary.removeObjects(toRemove);
}

export default Ember.Component.extend({
  // Inputs
  initialStr:           null,
  initialMap:           null,
  kvSeparator:          '=',
  requiredIfAny:        null,
  addActionLabel:       'formKeyValue.addAction',
  keyLabel:             'formKeyValue.key.label',
  valueLabel:           'formKeyValue.value.label',
  keyPlaceholder:       'formKeyValue.key.placeholder',
  valuePlaceholder:     'formKeyValue.value.placeholder',
  allowEmptyValue:      false,
  addInitialEmptyRow:   false,
  allowMultilineValue:  true,
  editing:              true,
  ary:                  null,

  actions: {
    add() {
      let ary      = this.get('ary');
      let required = this.get('requiredIfAny');

      if ( required && !ary.get('length') ) {
        Object.keys(required).forEach((k) => {
          ary.pushObject(Ember.Object.create({key: k, value: required[k], editable: false}));
        });
      }

      ary.pushObject(Ember.Object.create({key: '', value: ''}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.key').last()[0].focus();
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
    },

    pastedLabels(str, target) {
      var ary = this.get('ary');
      str     = str.trim();

      if ( str.indexOf('=') === -1 )
      {
        // Just pasting a key
        $(target).val(str);
        return;
      }

      var lines = str.split(/\r?\n/);
      applyLinesIntoArray(lines, ary);
      removeEmptyEntries(ary, this.get('allowEmptyValue'));
    },
  },

  init() {
    this._super(...arguments);

    var ary = [];
    var map = this.get('initialMap');
    if ( map )
    {
      Object.keys(map).forEach((key) => {
        ary.push(Ember.Object.create({key: key, value: map[key]}));
      });
    }
    else if ( this.get('initialStr') )
    {
      let lines    = this.get('initialStr').split(',');
      let required = this.get('requiredIfAny');

      applyLinesIntoArray(lines, ary, this.get('kvSeparator'));
      removeEmptyEntries(ary, this.get('allowEmptyValue'));

      if (required) {
        Object.keys(required).forEach((key) => {
          let line = ary.findBy('key', key);
          line.editable = false;
        });
      }

    }

    this.set('ary', ary);
    if ( !ary.length && this.get('addInitialEmptyRow') )
    {
      this.send('add');
    }
  },

  aryObserver: Ember.on('init', Ember.observer('ary.@each.{key,value}', function() {
    Ember.run.debounce(this,'fireChanged',100);
  })),

  fireChanged() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    var map = {};
    var str = '';

    this.get('ary').forEach((row) => {
      var k = row.get('key').trim();
      var v = row.get('value').trim();

      if ( k && (v || this.get('allowEmptyValue')) )
      {
        map[k] = v;
        str += (str ? ', ' : '') + k + (v ? this.get('kvSeparator') + v : '');
      }
    });

    this.sendAction('changed', map);
    this.sendAction('changedStr', str);
  },
});
