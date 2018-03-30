import $ from 'jquery';
import { later, schedule } from '@ember/runloop';
import { computed, get, set, setProperties } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';
import C from 'ui/utils/constants';
import { isEmpty } from '@ember/utils';

const USER_PASS_PROVIDERS = ['local','activedirectory'];

export default Controller.extend({
  queryParams:         ['errorMsg', 'resetPassword', 'errorCode'],
  access:              service(),
  settings:            service(),
  intl:                service(),
  globalStore:         service(),
  modalService:        service('modal'),
  router:              service(),
  session:             service(),

  promptPasswordReset: alias('resetPassword'),
  isForbidden:         equal('errorCode', '403'),

  waiting:             false,
  errorMsg:            null,
  errorCode:           null,
  resetPassword:       false,
  code:                null,

  isGithub: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'github');
  }),

  isActiveDirectory: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'activedirectory');
  }),

  isOpenLdap: computed('access.provider',  function() {
    return !!get(this, 'access.providers').findBy('id', 'openldap');
  }),

  isLocal: computed('access.providers', function() {
    return !!get(this, 'access.providers').findBy('id', 'local');
  }),

  onlyLocal: computed('access.providers.@each.id', function() {
    const providers = (get(this, 'access.providers')||[]).filter(x => x.id !== 'local');
    return get(providers, 'length') === 0;
  }),

  isAzureAd: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'azuread');
  }),

  isShibboleth: computed('access.provider', function() {
    return !!get(this, 'access.providers').findBy('id', 'shibboleth');
  }),

  isCaas: computed('app.mode', function() {
    return get(this, 'app.mode') === 'caas' ? true : false;
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

  actions: {

    started() {
      setProperties(this, {
        'waiting': true,
        'errorMsg': null,
      });
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
      get(this, 'router').replaceWith('authenticated');
    },

    authenticate(provider, code) {
      this.send('started');

      later(() => {
        get(this, 'access').login(provider, code).then((user) => {
          if ( get(user, 'mustChangePassword') && provider === 'local' ) {
            get(this,'session').set(C.SESSION.BACK_TO, window.location.origin);
            get(this, 'access').set('userCode', code);
            get(this, 'router').transitionTo('update-password');
          } else {
            setProperties(this, {
              user: null,
              code: null,
            });
            get(this, 'access').set('userCode', null);
            this.send('complete', true);
          }
        }).catch((err) => {
          set(this, 'waiting', false);

          if ( err && err.status === 401 ) {
            let key = 'loginPage.error.authFailed'
            if ( USER_PASS_PROVIDERS.includes(provider) ) {
              key = 'loginPage.error.authFailedCreds';
            }

            set(this, 'errorMsg', get(this, 'intl').t(key));
          } else {
            set(this, 'errorMsg', (err ? err.message : "No response received"));
          }
        }).finally(() => {
          set(this, 'waiting',false);
        });
      }, 10);
    },

    reload() {
      window.location.href = '/login';
    }
  },

  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      var reload = $('.reload-btn')[0];
      var user = $('.login-user')[0];
      var pass = $('.login-pass')[0];

      if ( reload ) {
        setTimeout(() => {
          reload.focus();
        }, 250);
      } else if ( user ) {
        if ( user.value ) {
          pass.focus();
        } else {
          user.focus();
        }
      }
    });
  }),

  infoMsg: computed('errorMsg','intl.locale', function() {
    if ( get(this, 'errorMsg') ) {
      return get(this, 'errorMsg');
    } else {
      return '';
    }
  }),
});
