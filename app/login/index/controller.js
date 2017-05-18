import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams       : ['timedOut','errorMsg', 'resetPassword'],
  access            : Ember.inject.service(),
  settings          : Ember.inject.service(),
  intl              : Ember.inject.service(),

  isGithub          : Ember.computed.equal('access.provider', 'githubconfig'),
  isActiveDirectory : Ember.computed.equal('access.provider', 'ldapconfig'),
  isOpenLdap        : Ember.computed.equal('access.provider', 'openldapconfig'),
  isLocal           : Ember.computed.equal('access.provider', 'localauthconfig'),
  isAzureAd         : Ember.computed.equal('access.provider', 'azureadconfig'),
  isShibboleth      : Ember.computed.equal('access.provider', 'shibbolethconfig'),
  isCaas            : Ember.computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
  promptPasswordReset: Ember.computed.alias('resetPassword'),

  timedOut          : false,
  waiting           : false,
  errorMsg          : null,
  resetPassword     : false,

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

      Ember.run.later(() => {
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
    Ember.run.schedule('afterRender', this, () => {
      var user = Ember.$('.login-user')[0];
      var pass = Ember.$('.login-pass')[0];
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
