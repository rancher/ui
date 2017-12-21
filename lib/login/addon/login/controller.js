import $ from 'jquery';
import { later, schedule } from '@ember/runloop';
import { computed, get, set } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { on } from '@ember/object/evented';

export default Controller.extend({
  queryParams       : ['timedOut','errorMsg', 'resetPassword', 'errorCode'],
  access            : service(),
  settings          : service(),
  intl              : service(),
  globalStore:        service(),
  modalService:       service('modal'),

  isGithub          : equal('access.provider', 'githubconfig'),
  isActiveDirectory : equal('access.provider', 'ldapconfig'),
  isOpenLdap        : equal('access.provider', 'openldapconfig'),
  isLocal           : true, // @TODO-2.0 equal('access.provider', 'localauthconfig'),
  isAzureAd         : equal('access.provider', 'azureadconfig'),
  isShibboleth      : equal('access.provider', 'shibbolethconfig'),
  isCaas            : computed('app.mode', function() {
    return get(this, 'app.mode') === 'caas' ? true : false;
  }),
  promptPasswordReset: alias('resetPassword'),

  timedOut          : false,
  waiting           : false,
  errorMsg          : null,
  errorCode         : null,
  resetPassword     : false,
  isForbidden       : equal('errorCode', '403'),

  router: service(),
  actions: {
    started() {
      this.setProperties({
        'timedOut': false,
        'waiting': true,
        'errorMsg': null,
      });
    },

    complete(success) {
      if (success) {
        get(this, 'router').replaceWith('authenticated');
      }
    },

    authenticate(code) {
      this.send('started');

      later(() => {
        get(this, 'access').login(code).then((user) => {
          if (user.mustChangePassword) {
            set(this, 'changePassword', user.mustChangePassword)
          } else {
            this.send('finishLogin');
          }
        }).catch((err) => {
          set(this, 'waiting', false);

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

  infoMsg: computed('timedOut','errorMsg','intl.locale', function() {
    if ( get(this, 'errorMsg') ) {
      return get(this, 'errorMsg');
    } else if ( get(this, 'timedOut') ) {
      return get(this, 'intl').t('loginPage.error.timedOut');
    } else {
      return '';
    }
  }),
});
