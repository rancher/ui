import $ from 'jquery';
import { later, schedule } from '@ember/runloop';
import { computed } from '@ember/object';
import { equal, alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default Controller.extend({
  queryParams       : ['timedOut','errorMsg', 'resetPassword', 'errorCode'],
  access            : service(),
  settings          : service(),
  intl              : service(),

  isGithub          : equal('access.provider', 'githubconfig'),
  isActiveDirectory : equal('access.provider', 'ldapconfig'),
  isOpenLdap        : equal('access.provider', 'openldapconfig'),
  isLocal           : true, // @TODO-2.0 equal('access.provider', 'localauthconfig'),
  isAzureAd         : equal('access.provider', 'azureadconfig'),
  isShibboleth      : equal('access.provider', 'shibbolethconfig'),
  isCaas            : computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
  promptPasswordReset: alias('resetPassword'),

  timedOut          : false,
  waiting           : false,
  errorMsg          : null,
  errorCode         : null,
  resetPassword     : false,
  isForbidden       : equal('errorCode', '403'),

  actions: {
    started() {
      this.setProperties({
        'timedOut': false,
        'waiting': true,
        'errorMsg': null,
      });
    },

    authenticate(code) {
      this.send('started');

      later(() => {
        this.get('access').login(code).then(() => {
          this.send('finishLogin');
        }).catch((err) => {
          this.set('waiting', false);

          if ( err && err.status === 401 ) {
            this.set('errorMsg', this.get('intl').t('loginPage.error.authFailed'));
          } else {
            this.set('errorMsg', (err ? err.message : "No response received"));
          }
        }).finally(() => {
          this.set('waiting',false);
        });
      }, 10);
    }
  },

  bootstrap: function() {
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
  }.on('init'),

  infoMsg: function() {
    if ( this.get('errorMsg') ) {
      return this.get('errorMsg');
    } else if ( this.get('timedOut') ) {
      return this.get('intl').t('loginPage.error.timedOut');
    } else {
      return '';
    }
  }.property('timedOut','errorMsg','intl.locale'),
});
