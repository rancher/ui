import { later } from '@ember/runloop';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  errors: null,

  classNames:        ['banner', 'bg-error'],
  classNameBindings: ['errors.length::hide'],

  errorsDidChange: function() {
    if ( this.get('errors.length') ) {
      later(() => {
        this.$().scrollIntoView();
      }, 100);
    }
  }.property('errors.[]'),
});
