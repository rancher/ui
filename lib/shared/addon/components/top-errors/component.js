import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';
import { get, set, computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend({
  layout,
  errors: null,

  classNames:        ['banner', 'bg-error'],
  classNameBindings: ['errors.length::hide'],

  init() {
    this._super(...arguments);

    set(this, 'errors', []);
  },

  errorsDidChange: computed('errors.[]', function() {
    if ( get(this, 'errors.length') ) {
      later(() => {
        $().scrollIntoView();
      }, 100);
    }
  }),
});
