import $ from 'jquery';
import { later, schedule } from '@ember/runloop';
import { computed, get, set, setProperties } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';

export default Controller.extend({
  queryParams       : ['errorMsg', 'resetPassword', 'errorCode'],
  access            : service(),
  settings          : service(),
  intl              : service(),
  globalStore:        service(),
  modalService:       service('modal'),

  isGithub          : computed('access.providers', function() {
    let gh = get(this, 'access.providers').findBy('id', 'github');
    return gh && get(gh, 'enabled');
  }),
  isActiveDirectory : computed('access.provider', function() {
    return get(this, 'access.providers').findBy('id', 'activedirectory');
  }),
  isOpenLdap        : computed('access.provider',  function() {
    return get(this, 'access.providers').findBy('id', 'openldapconfig');
  }),
  isLocal           : true, // @TODO-2.0 equal('access.provider', 'localauthconfig'),
  isAzureAd         : computed('access.provider', function() {
    return get(this, 'access.providers').findBy('id', 'azureadconfig');
  }),
  isShibboleth      : computed('access.provider', function() {
    return get(this, 'access.providers').findBy('id', 'shibbolethconfig');
  }),
  isCaas            : computed('app.mode', function() {
    return get(this, 'app.mode') === 'caas' ? true : false;
  }),

  authCount         : computed('access.providers', function() {
    return get(this, 'access.providers.length') === 1;
  }),
  promptPasswordReset: alias('resetPassword'),

  waiting           : false,
  errorMsg          : null,
  errorCode         : null,
  changePassword    : false,
  resetPassword     : false,
  isForbidden       : equal('errorCode', '403'),
  code              : null,

  router: service(),
  actions: {
    started() {
      setProperties(this, {
        'waiting': true,
        'errorMsg': null,
      });
    },

    complete(success) {
      if (success) {
        set(this, 'code', null);
        get(this, 'router').replaceWith('authenticated');
      }
    },

    authenticate(provider, code) {
      this.send('started');

      later(() => {
        get(this, 'access').login(provider, code).then((user) => {
          if ( user.mustChangePassword && provider === 'local' ) {
            setProperties(this, {
              user: user,
              changePassword: true,
              code: code,
            });
          } else {
            setProperties(this, {
              user: null,
              changePassword: false,
              code: null,
            });
            this.send('finishLogin');
          }
        }).catch((err) => {
          set(this, 'waiting', false);
          set(this, 'changePassword', false);

          if ( err && err.status === 401 ) {
            set(this, 'errorMsg', get(this, 'intl').t('loginPage.error.authFailed'));
          } else {
            set(this, 'errorMsg', (err ? err.message : "No response received"));
          }
        }).finally(() => {
          set(this, 'waiting',false);
        });
      }, 10);
    }
  },

  bootstrap: on('init', function() {
    schedule('afterRender', this, () => {
      var user = $('.login-user')[0];
      var pass = $('.login-pass')[0];
      if ( user )
      {
        if ( user.value )
        {
          pass.focus();
        }
        else
        {
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
