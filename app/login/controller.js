import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams       : ['timedOut','errorMsg'],
  access            : Ember.inject.service(),
  settings          : Ember.inject.service(),

  isGithub          : Ember.computed.equal('access.provider', 'githubconfig'),
  isActiveDirectory : Ember.computed.equal('access.provider', 'ldapconfig'),
  isOpenLdap        : Ember.computed.equal('access.provider', 'openldapconfig'),
  isLocal           : Ember.computed.equal('access.provider', 'localauthconfig'),
  isAzureAd         : Ember.computed.equal('access.provider', 'azureadconfig'),

  timedOut          : false,
  waiting           : false,
  errorMsg          : null,

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

          if ( err.status === 401 ) {
            this.set('errorMsg', 'Username or Password incorrect.');
          } else {
            this.set('errorMsg', err.message);
          }
        }).finally(() => {
          this.set('waiting',false);
        });
      }, 10);
    }
  },

  bootstrap: function() {
    Ember.run.schedule('afterRender', this, () => {
      $('BODY').addClass('farm');
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
      return 'Your session has timed out.  Log in again to continue.';
    } else {
      return '';
    }
  }.property('timedOut','errorMsg'),

  willDestroy: function() {
    $('BODY').removeClass('farm');
  },
});
