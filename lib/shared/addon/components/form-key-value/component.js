import { on } from '@ember/object/evented';
import { next, debounce } from '@ember/runloop';
import Component from '@ember/component';
import EmberObject, { set, observer } from '@ember/object';
import layout from './template';

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
      set(existing,'value',val);
    }
    else
    {
      ary.pushObject(EmberObject.create({key: key, value: val}));
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

export default Component.extend({
  layout,
  // Inputs
  initialStr:           null,
  initialMap:           null,
  initialArray:         null,
  kvSeparator:          '=',
  requiredIfAny:        null,
  addActionLabel:       'formKeyValue.addAction',
  keyLabel:             'formKeyValue.key.label',
  valueLabel:           'formKeyValue.value.label',
  keyPlaceholder:       'formKeyValue.key.placeholder',
  valuePlaceholder:     'formKeyValue.value.placeholder',
  allowEmptyValue:      false,
  allowAdd:             true,
  allowRemove:          true,
  allowEditKey:         true,
  addInitialEmptyRow:   false,
  allowMultilineValue:  true,
  base64Value:          false,
  concealValue:         false,
  editing:              true,
  ary:                  null,

  actions: {
    add() {
      let ary      = this.get('ary');
      let required = this.get('requiredIfAny');

      if ( required && !ary.get('length') ) {
        Object.keys(required).forEach((k) => {
          ary.pushObject(EmberObject.create({key: k, value: required[k], editable: false}));
        });
      }

      ary.pushObject(EmberObject.create({key: '', value: ''}));
      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        let elem = this.$('INPUT.key').last()[0];
        if ( elem ) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
    },

    pastedValues(str, target) {
      var ary = this.get('ary');
      str     = str.trim();

      if ( str.indexOf('=') === -1 && str.indexOf(': ') === -1)
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
        ary.push(EmberObject.create({key: key, value: map[key]}));
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
    else if ( this.get('initialArray') )
    {
      this.get('initialArray').forEach((line) => {
        ary.push(EmberObject.create({key: line.key, value: line.value}));
      });
    }

    if ( this.get('base64Value') ) {
      ary.forEach((entry) => {
        entry.value = AWS.util.base64.decode(entry.value).toString();
      });
    }

    this.set('ary', ary);
    if ( !ary.length && this.get('addInitialEmptyRow') )
    {
      this.send('add');
    }
  },

  aryObserver: on('init', observer('ary.@each.{key,value}', function() {
    debounce(this,'fireChanged',100);
  })),

  fireChanged() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    var map = {};
    var str = '';
    var arr = [];

    this.get('ary').forEach((row) => {
      var k = row.get('key').trim();
      var v = row.get('value').trim();

      if ( this.get('base64Value') ) {
        v = AWS.util.base64.encode(v);
      }

      if ( k && (v || this.get('allowEmptyValue')) )
      {
        map[k] = v;
        str += (str ? ', ' : '') + k + (v ? this.get('kvSeparator') + v : '');
        arr.push({
          key: k,
          value: v,
        });
      }
    });

    this.sendAction('changed', map);
    this.sendAction('changedStr', str);
    this.sendAction('changedArray', arr);
  },
});
