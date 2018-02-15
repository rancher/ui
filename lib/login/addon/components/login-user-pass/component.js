import { get, set, computed } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import C from 'ui/utils/constants';

export default Component.extend({
  access: service(),
  cookies: service(),
  isCaas: computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
  waiting: null,

  username: null,
  rememberUsername: false,
  password: null,

  actions: {
    authenticate: function() {
      const username = get(this, 'username');
      const password = get(this, 'password');
      const remember = get(this, 'rememberUsername');

      const code = {
        username: username,
        password: password,
      };

      if ( remember ) {
        get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, username, {expire: 365, secure: 'auto'});
      } else {
        get(this, 'cookies').remove(C.COOKIE.USERNAME);
      }

      set(this, 'password', '');
      if ( get(this,'access.providers') ) {
        this.sendAction('action', 'local', code);
      }
    }
  },

  didInitAttrs() {
    const username = get(this, `cookies.${C.COOKIE.USERNAME}`);
    if ( username ) {
      set(this, 'username', username);
      set(this, 'rememberUsername', true);
    }
  },

  focusSomething() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    let elem = this.$('#login-username');
    if ( get(this, 'username') ) {
      elem = this.$('#login-password');
    }

    if ( elem && elem[0] ) {
      elem[0].focus();
    }
  },

  didInsertElement() {
    next(this, 'focusSomething');
  },
});
