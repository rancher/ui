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
  shown: false,
  provider: null,
  readableProvider: null,
  onlyLocal: null,

  actions: {
    showLocal() {
      this.toggleProperty('shown');
      next(this, 'focusSomething');
    },
    authenticate: function() {
      const username = get(this, 'username');
      let password = get(this, 'password');
      const remember = get(this, 'rememberUsername');

      if (password && get(this, 'provider') === 'local') {
        password = password.trim();
      }

      const code = {
        username: username,
        password: password,
      };

      if ( remember ) {
        if (get(this, 'provider') === 'local') {
          get(this, 'cookies').setWithOptions(C.COOKIE.USERNAME, username, {expire: 365, secure: 'auto'});
        } else {
          get(this, 'cookies').setWithOptions(`${get(this, 'provider').toUpperCase()}-USERNAME`, username, {expire: 365, secure: 'auto'});
        }
      } else {
        get(this, 'cookies').remove(C.COOKIE.USERNAME);
      }

      set(this, 'password', '');
      if ( get(this,'access.providers') ) {
        this.sendAction('action', get(this, 'provider'), code);
      }
    }
  },

  init() {
    this._super(...arguments);

    var username = null;
    if (get(this, 'provider') === 'local') {
      username = get(this, `cookies.${C.COOKIE.USERNAME}`);
    } else {
      username = get(this, `cookies.${get(this, 'provider').toUpperCase()}-USERNAME`);
    }

    if ( username ) {
      set(this, 'username', username);
      set(this, 'rememberUsername', true);
    }

    if (get(this, 'provider') && !get(this,'onlyLocal')) {
      let pv = null;
      switch(get(this, 'provider')) {
      case 'activedirectory':
        pv = 'Active Directory';
        break;
      case 'local':
      default:
        pv = 'a Local User';
        break;
      }

      set(this, 'readableProvider', pv);

      // console.log(this.get('provider'));
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
