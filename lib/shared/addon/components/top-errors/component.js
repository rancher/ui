import $ from 'jquery';
import Component from '@ember/component';
import layout from './template';
import { get, set, observer } from '@ember/object';
import { later } from '@ember/runloop';
import { on } from '@ember/object/evented';

export default Component.extend({
  layout,
  errors: null,

  classNames:        ['banner', 'bg-error'],
  classNameBindings: ['errors.length::hide'],

  init() {
    this._super(...arguments);

    set(this, 'errors', []);
  },

  errorsDidChange: on('init', observer('errors.[]', function() {
    if ( get(this, 'errors.length') ) {
      later(() => {
        try {
          $(this.element)[0].scrollIntoView();
        } catch (error) { }
      }, 100);
    }
  })),
});
