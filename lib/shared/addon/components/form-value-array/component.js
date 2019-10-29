import { next } from '@ember/runloop';
import { get, set } from '@ember/object';
import EmberObject from '@ember/object';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  // Inputs
  initialValues:    null,
  addActionLabel:   'formValueArray.addActionLabel',
  valueLabel:       'formValueArray.valueLabel',
  valuePlaceholder: 'formValueArray.valuePlaceholder',
  noDataLabel:      'formValueArray.noData',
  showProTip:       true,
  editing:          true,
  required:         false,
  autoAddIfEmpty:   false,
  defaultValue:     '',
  addButtonClass:   'btn bg-link icon-btn mt-10',
  content:          null,
  onlyEditLast:     false,

  ary:      [],
  asValues: null,

  init() {
    this._super(...arguments);

    var ary = [];

    (get(this, 'initialValues') || []).forEach((value) => {
      const v = value;

      ary.push(EmberObject.create({ v }));
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
      const newValue = EmberObject.create({ value: get(this, 'defaultValue') });

      if (this.changed) {
        return this.changed([...(this.ary || []), newValue]);
      }
      next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        get(this, 'ary').pushObject(newValue);

        const elem = this.$('INPUT.value').last()[0];

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
});
