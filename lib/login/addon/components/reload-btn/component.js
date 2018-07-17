import Component from '@ember/component';
import { next } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  didInsertElement() {
    next(this, () => {
      var btn = $('.reload-btn')[0]; // eslint-disable-line

      if ( btn ) {
        btn.focus();
      }
    });
  },
  actions: {
    reload() {
      window.location.href = '/login';
    }
  },

});
