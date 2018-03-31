import Component from '@ember/component';
import { next } from '@ember/runloop';

export default Component.extend({
  tagName: '',

  actions: {
    reload() {
      window.location.href = '/login';
    }
  },

  didInsertElement() {
    next(this, () => {
      var btn = $('.reload-btn')[0];
      if ( btn ) {
        btn.focus();
      }
    });
  },
});
