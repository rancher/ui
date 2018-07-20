import { alias } from '@ember/object/computed';
import { get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  allStorageClasses: service(),

  layout,
  field: null,
  value: null,

  selected: null,
  disabled: false,

  storageClassesOptions: alias('allStorageClasses.list'),

  init() {
    this._super(...arguments);

    const def = get(this, 'value') || get(this, 'field.default');

    if ( def && !get(this, 'selected') ) {
      const exact = get(this, 'storageClassesOptions').findBy('id', def);

      next(() => {
        if ( exact ) {
          set(this, 'selected', get(exact, 'id') || null);
        } else {
          set(this, 'selected', null);
        }
      });
    }
  },

  selectedChanged: observer('selected', function() {
    let id = get(this, 'selected');
    let str = null;

    if ( id ) {
      const storageClass = get(this, 'storageClassesOptions').findBy('id', id);

      if ( storageClass ) {
        str = get(storageClass, 'id');
      }
    }

    set(this, 'value', str);
  }),
});
