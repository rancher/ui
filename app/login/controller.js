import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['timedOut','errorMsg'],
  access: Ember.inject.service(),

  isGithub: Ember.computed.equal('access.provider', 'githubconfig'),
  isActiveDirectory: Ember.computed.equal('access.provider', 'ldapconfig'),
  isOpenLdap: Ember.computed.equal('access.provider', 'openldapconfig'),
  isLocal: Ember.computed.equal('access.provider', 'localauthconfig'),

  timedOut: false,
  waiting: false,
  errorMsg: null,

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
          this.replaceWith('authenticated');
        }).catch((err) => {
          this.set('waiting', false);

          if ( err.status === 401 )
          {
            this.set('errorMsg', 'Username or Password incorrect.');
          }
          else
          {
            this.set('errorMsg', err.message);
          }
        }).finally(() => {
          this.set('waiting',false);
        });
      }, 10);
    }
  },

  infoMsg: function() {
    if ( this.get('errorMsg') )
    {
      return this.get('errorMsg');
    }
    else if ( this.get('timedOut') )
    {
      return 'Your session has timed out.  Log in again to continue.';
    }
    else
    {
      return '';
    }
  }.property('timedOut','errorMsg'),
});
