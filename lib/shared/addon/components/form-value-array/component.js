import { next } from '@ember/runloop';
import EmberObject, { get, set, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import $ from 'jquery';

export default Component.extend({
  layout,
  // Inputs
  initialValues:     null,
  addActionLabel:    'formValueArray.addActionLabel',
  valueLabel:        'formValueArray.valueLabel',
  valuePlaceholder:  'formValueArray.valuePlaceholder',
  noDataLabel:       'formValueArray.noData',
  showProTip:        true,
  editing:           true,
  valueLabelEnabled: true,
  required:          false,
  autoAddIfEmpty:    false,
  addButtonEnabled:  true,
  defaultValue:      '',
  addButtonClass:    'btn bg-link icon-btn mt-10',

  ary:               null,
  asValues:          null,

  init() {
    this._super(...arguments);

    var ary = [];

    (get(this, 'initialValues') || []).forEach((value) => {
      ary.push(EmberObject.create({ value }));
    });

    set(this, 'ary', ary);
  },

  didInsertElement() {
    if ( get(this, 'autoAddIfEmpty') && get(this, 'ary.length') === 0 ) {
      this.send('add');
    }
  },

  actions: {
    add() {
      get(this, 'ary').pushObject(EmberObject.create({ value: get(this, 'defaultValue') }));
      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        const elem = $('INPUT.value').last()[0];

        if ( elem ) {
          elem.focus();
        }
      });
    },

    remove(obj) {
      get(this, 'ary').removeObject(obj);
    },

    pastedValues(str) {
      var ary = get(this, 'ary');

      str = str.trim();

      var lines = str.split(/\r?\n/);

      lines.forEach((line) => {
        line = line.trim();
        if ( !line ) {
          return;
        }

        ary.pushObject(EmberObject.create({ value: line }));
      });

      // Clean up empty user entries
      var toRemove = [];

      ary.forEach((item) => {
        if ( !item.get('value') ) {
          toRemove.push(item);
        }
      });

      ary.removeObjects(toRemove);
    },
  },

  asValuesObserver: observer('ary.@each.value', function() {
    var out = get(this, 'ary').filterBy('value').map((row) => {
      return row.get('value');
    });

    set(this, 'asValues', out);
    if (this.changed) {
      this.changed(out);
    }
  }),
});
