import $ from 'jquery';
import { later, schedule } from '@ember/runloop';
import {
  get, set, computed, observer, setProperties
} from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';
import { next } from '@ember/runloop';

const USER_PASS_PROVIDERS = ['local', 'activedirectory', 'openldap', 'freeipa'];

export default Controller.extend({
  access:              service(),
  settings:            service(),
  prefs:               service(),
  intl:                service(),
  globalStore:         service(),
  modalService:        service('modal'),
  router:              service(),
  session:             service(),

  queryParams:         ['errorMsg', 'resetPassword', 'errorCode', 'requestId', 'publicKey', 'responseType'],
  waiting:             false,
  adWaiting:           false,
  localWaiting:        false,
  shibbolethWaiting:   false,
  errorMsg:            null,
  errorCode:           null,
  resetPassword:       false,
  code:                null,
  showLocal:           null,

  promptPasswordReset: alias('resetPassword'),
  isForbidden:         equal('errorCode', '403'),

  actions: {
    started() {
      setProperties(this, {
        'waiting':  true,
        'errorMsg': null,
      });
    },

    waiting(provider) {
      set(this, 'errorMsg', null);

      switch (provider) {
      case 'local':
        this.toggleProperty('localWaiting');
        break;
      case 'activedirectory':
      case 'openldap':
      case 'freeipa':
        this.toggleProperty('adWaiting');
        break;
      case 'azuread':
        this.toggleProperty('azureadWaiting');
        break;
      case 'shibboleth':
        this.toggleProperty('shibbolethWaiting');
        break;
      default:
        break;
      }
    },

    complete(success) {
      if (success) {
        this.shouldSetServerUrl().then((proceed) => {
          if (proceed) {
            this.send('finishComplete');
          } else {
            get(this, 'router').transitionTo('update-critical-settings');
          }
        });
      }
    },

    finishComplete() {
      set(this, 'code', null);

      const redirectURL = get(this, `session.${ C.SESSION.BACK_TO }`);

      if ( this.shouldRedirect(redirectURL) ) {
        window.location.href = redirectURL;
      } else {
        get(this, 'globalStore').find('preference', null, { url: 'preference' }).then(() => {
          if ( get(this, `prefs.${ C.PREFS.LANDING }`) === 'vue' ) {
            let link = '/dashboard';

            if ( get(this, 'app.environment') === 'development' ) {
              link = 'https://localhost:8005/';
            }

            window.location.href = link;

            return;
          }

          get(this, 'router').replaceWith('authenticated');
        });
      }
    },

    authenticate(provider, code) {
      this.send('waiting', provider);

      later(() => {
        get(this, 'access').login(provider, code).then((user) => {
          if ( get(user, 'mustChangePassword') && provider === 'local' ) {
            get(this, 'session').set(C.SESSION.BACK_TO, window.location.origin);
            get(this, 'access').set('userCode', code);
            get(this, 'router').transitionTo('update-password');
          } else {
            setProperties(this, {
              user: null,
              code: null,
            });
            get(this, 'access').set('userCode', null);
            get(this, 'access').set('firstLogin', false);
            this.send('complete', true);
            this.send('waiting', provider);
          }
        }).catch((err) => {
          this.send('waiting', provider);

          if (err) {
            let key;

            if ( [401, 403].includes(err.status) ) {
              key = 'authFailed'

              if ( USER_PASS_PROVIDERS.includes(provider) ) {
                key = 'authFailedCreds';
              }
            } else {
              key = 'unknown';

              if (this.intl.exists(`loginPage.error.${ err.message }`)) {
                key = err.message;
              }
            }

            set(this, 'errorMsg', key);
          }
        });
      }, 10);
    },

    toggleAuth() {
      this.toggleProperty('showLocal');
      next(this, 'focusSomething');
    },
  },

  initErrorChanged: observer('app.initError', function() {
    this.focusSomething(); // focus the button..
  }),

  isGithub: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'github');
  }),

  isGoogle: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'googleoauth');
  }),

  isPing: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'ping');
  }),

  isKeycloak: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'keycloak');
  }),

  isAdfs: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'adfs');
  }),

  isOkta: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'okta');
  }),

  isActiveDirectory: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'activedirectory');
  }),

  isOpenLdap: computed('access.provider',  function() {
    return !!get(this, 'access.providers').findBy('id', 'openldap');
  }),

  isFreeIpa: computed('access.provider',  function() {
    return !!get(this, 'access.providers').findBy('id', 'freeipa');
  }),

  isLocal: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'local');
  }),

  onlyLocal: computed('access.providers.@each.id', function() {
    const providers = (get(this, 'access.providers') || []).filter((x) => x.id !== 'local');

    return get(providers, 'length') === 0;
  }),

  externalProvider: computed('access.providers.@each.id', function() {
    const providers = (get(this, 'access.providers') || []).filter((x) => x.id !== 'local');

    return providers[0] && providers[0].id;
  }),

  isAzureAd: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'azuread');
  }),

  isShibboleth: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'shibboleth');
  }),

  bootstrap: on('init', function() {
    schedule('afterRender', this, 'focusSomething');
  }),

  infoMsg: computed('errorMsg', 'errorCode', 'intl.locale', function() {
    let { errorMsg: errorMessageKey } = this;


    if ( errorMessageKey ) {
      return this.intl.t(`loginPage.error.${ errorMessageKey }`);
    } else if ( get(this, 'isForbidden') ) {
      return this.intl.t('loginPage.error.authFailed');
    } else {
      return '';
    }
  }),

  shouldSetServerUrl() {
    // setting isn't loaded yet
    let globalStore = get(this, 'globalStore');

    return globalStore.find('setting', C.SETTING.SERVER_URL).then((serverUrl) => {
      if (serverUrl && isEmpty(get(serverUrl, 'value')) && get(serverUrl, 'links.update')) {
        return false;
      }

      return true;
    });
  },

  focusSomething() {
    var user = $('.login-user')[0];
    var pass = $('.login-pass')[0];

    if ( user ) {
      if ( user.value ) {
        pass.focus();
      } else {
        user.focus();
      }
    }
  },

  shouldRedirect(redirect) {
    if ( !redirect ) {
      return false;
    }

    const current = `${ window.location.origin }${ window.location.pathname }` ;

    if ( current === redirect || `${ rootUrl }/` === redirect ) {
      return false;
    }

    const rootUrl = current.substr(0, current.length - 6);

    if ( redirect.startsWith(rootUrl) && redirect !== rootUrl && redirect !== `${ rootUrl }/` ) {
      return true;
    }

    return false;
  },

  isInsecure: window.location.protocol === 'http:',

});
