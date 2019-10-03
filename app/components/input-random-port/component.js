import { set, get } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import { next } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  layout,

  showEdit: false,

  min:         '1',
  max:         '65535',
  value:       null,
  standardKey: 'generic.random',
  placeholder: null,

  init() {
    this._super(...arguments);
    if (get(this, 'value')) {
      set(this, 'showEdit', true);
    }
  },

  actions: {
    showEdit() {
      set(this, 'showEdit', true);

      next(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        $('INPUT').last()[0].focus();
      });
    }
  }
});
