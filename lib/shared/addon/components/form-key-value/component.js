import { on } from '@ember/object/evented';
import { next, debounce } from '@ember/runloop';
import Component from '@ember/component';
import { get, set, observer } from '@ember/object'
import Upload from 'shared/mixins/upload';
import layout from './template';
import $ from 'jquery';
import { asciiLike } from 'shared/utils/util';

function applyLinesIntoArray(lines, ary) {
  lines.forEach((line) => {
    line = line.trim();

    if ( !line ) {
      return;
    }

    let idx = line.indexOf('=');

    if ( idx === -1 ) {
      idx = line.indexOf(': ');
    }

    let key = '';
    let val = '';

    if ( idx > 0 ) {
      key = line.substr(0, idx).trim();
      val = line.substr(idx + 1).trim();
    } else {
      key = line.trim();
      val = '';
    }

    var existing = ary.filterBy('key', key)[0];

    if ( existing ) {
      set(existing, 'value', val);
    } else {
      ary.pushObject({
        key,
        value: val
      });
    }
  });
}

function removeEmptyEntries(ary, allowEmptyValue = false) {
  // Clean up empty user entries
  let toRemove = [];

  ary.forEach((item) => {
    if ( !get(item, 'key') && (!get(item, 'value') || !allowEmptyValue) ) {
      toRemove.push(item);
    }
  });

  ary.removeObjects(toRemove);
}

function isMultiline(val){
  let lines = val.split(/\r?\n/);

  return lines.length > 1;
}

export default Component.extend(Upload, {
  layout,
  // Inputs
  initialStr:           null,
  initialMap:           null,
  initialArray:         null,
  requiredIfAny:        null,
  readonlyArray:        null,
  keyContent:           null,
  valueContent:         null,
  ary:                  null,
  allowEmptyValue:      false,
  allowAdd:             true,
  allowUpload:          false,
  allowRemove:          true,
  allowEditKey:         true,
  addInitialEmptyRow:   false,
  allowMultilineValue:  true,
  base64Value:          false,
  showNoneLabel:        true,
  concealValue:         false,
  editing:              true,
  trimWhenMultiLines:   true,
  kvSeparator:          '=',
  separators:           ['=', ': '],
  addActionLabel:       'formKeyValue.addAction',
  keyLabel:             'formKeyValue.key.label',
  valueLabel:           'formKeyValue.value.label',
  keyPlaceholder:       'formKeyValue.key.placeholder',
  valuePlaceholder:     'formKeyValue.value.placeholder',
  uploadAction:         'pastedValues',

  init() {
    this._super(...arguments);

    var ary = [];
    var map = get(this, 'initialMap');
    const readonlyArray = get(this, 'readonlyArray') || [];

    if ( map ) {
      Object.keys(map).forEach((key) => {
        ary.push({
          key,
          value:    map[key],
          editable: readonlyArray.indexOf(key) === -1
        });
      });
    } else if ( get(this, 'initialStr') ) {
      let lines    = get(this, 'initialStr').split(',');
      let required = get(this, 'requiredIfAny');

      applyLinesIntoArray(lines, ary, get(this, 'kvSeparator'));

      removeEmptyEntries(ary, get(this, 'allowEmptyValue'));

      if (required) {
        Object.keys(required).forEach((key) => {
          let line = ary.findBy('key', key);

          line.editable = false;
        });
      }
    } else if ( get(this, 'initialArray') ) {
      get(this, 'initialArray').forEach((line) => {
        ary.push({
          key:   line.key,
          value: line.value
        });
      });
    }

    if ( get(this, 'base64Value') ) {
      ary.forEach((entry) => {
        const decoded = AWS.util.base64.decode(entry.value).toString();

        if ( typeof decoded === 'string' && !asciiLike(decoded) ) {
          set(entry, 'binary', true);
        } else {
          entry.value = decoded;
        }
      });
    }

    set(this, 'ary', ary);

    if ( !ary.length && get(this, 'addInitialEmptyRow') ) {
      this.send('add');
    }
  },

  // groupMap: null,

  actions: {
    add() {
      let ary      = get(this, 'ary');
      let required = get(this, 'requiredIfAny');

      if ( required && !get(ary, 'length') ) {
        Object.keys(required).forEach((k) => {
          ary.pushObject({
            key:      k,
            value:    required[k],
            editable: false
          });
        });
      }

      ary.pushObject({
        key:   '',
        value: ''
      });

      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        let elem = $('INPUT.key').last()[0];

        if ( elem && !get(this, 'keyContent') ) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      get(this, 'ary').removeObject(obj);
    },

    pastedValues(str) {
      let ary = get(this, 'ary');

      str = str.trim();

      let lines = str.split(/\r?\n/);

      applyLinesIntoArray(lines, ary);

      removeEmptyEntries(ary, get(this, 'allowEmptyValue'));
    },
  },

  aryObserver:         on('init', observer('ary.@each.{key,value}', function() {
    debounce(this, 'fireChanged', 100);
  })),

  fireChanged() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let map = {};
    let str = '';
    let arr = [];

    get(this, 'ary').forEach((row) => {
      var k = get(row, 'key').trim();
      var v;

      if ( get(row, 'value') !== undefined && get(row, 'value') !== null ) {
        v =  (`${ get(row, 'value')  }`);
        if ( isMultiline(v) ) {
          if ( this.trimWhenMultiLines ) {
            v = v.trim()
          }
        } else {
          v = v.trim()
        }
      }

      if ( get(this, 'base64Value') && !get(row, 'binary')) {
        v = AWS.util.base64.encode(v);
      }

      if ( k && (v || get(this, 'allowEmptyValue')) ) {
        map[k] = v;

        str += (str ? ', ' : '') + k + (v ? get(this, 'kvSeparator') + v : '');

        arr.push({
          key:   k,
          value: v,
        });
      }
    });

    next(() => {
      if (this.changed) {
        this.changed(map);
      }

      if (this.changedStr) {
        this.changedStr(str);
      }

      if (this.changedArray) {
        this.changedArray(arr);
      }
    });
  },
});
