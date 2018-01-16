import { computed } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { get } from '@ember/object';

export default Component.extend({
  access: service(),
  isCaas: computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
  waiting: null,

  username: null,
  password: null,

  actions: {
    authenticate: function() {
      var code = {
        description: 'UI Login',
        localCredential: {
          userName: get(this, 'username'),
          password: get(this, 'password'),
        },
        responseType: 'cookie'
      };
      this.set('password','');
      this.sendAction('action', code);
    }
  },

  didInsertElement() {
    next(() => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }
      this.$('INPUT')[0].focus();
    });
  },
});
