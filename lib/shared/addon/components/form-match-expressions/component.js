import { on } from '@ember/object/evented';
import { next, debounce } from '@ember/runloop';
import Component from '@ember/component';
import { get, set, observer } from '@ember/object'
import layout from './template';
import C from 'shared/utils/constants';
import $ from 'jquery';

const EXISTS = 'Exists'
const DOES_NOT_EXISTS = 'DoesNotExist';

export default Component.extend({
  layout,
  // Inputs
  initialArray:         null,
  editing:              true,
  addActionLabel:       'formMatchExpressions.addAction',
  keyLabel:             'formMatchExpressions.key.label',
  valueLabel:           'formMatchExpressions.value.label',
  keyPlaceholder:       'formMatchExpressions.key.placeholder',
  valuePlaceholder:     'formMatchExpressions.value.placeholder',

  init() {
    this._super(...arguments);

    const ary = [];

    if ( get(this, 'initialArray') ) {
      get(this, 'initialArray').forEach((line) => {
        ary.push({
          key:      get(line, 'key'),
          operator: get(line, 'operator'),
          values:   (get(line, 'values') || []).join(',')
        });
      });
    }

    set(this, 'ary', ary);
  },

  actions: {
    add() {
      let ary = get(this, 'ary');

      ary.pushObject({
        key:      '',
        operator: EXISTS,
      });

      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        let elem = $('INPUT.key').last()[0];

        if ( elem ) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      get(this, 'ary').removeObject(obj);
    },
  },

  aryObserver: on('init', observer('ary.@each.{key,operator,values}', function() {
    debounce(this, 'fireChanged', 100);
  })),

  operatorChoices: C.VOLUME_NODE_SELECTOR_OPERATOR,

  fireChanged() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let arr = [];

    get(this, 'ary').forEach((row) => {
      if ( [EXISTS, DOES_NOT_EXISTS].indexOf(get(row, 'operator')) > -1 ) {
        arr.pushObject({
          key:      get(row, 'key'),
          operator: get(row, 'operator'),
        })
      } else {
        if ( get(row, 'values') ) {
          arr.pushObject({
            key:      get(row, 'key'),
            operator: get(row, 'operator'),
            values:   get(row, 'values').split(',') || []
          })
        }
      }
    });

    next(() => {
      this.sendAction('changed', arr);
    });
  },
});
