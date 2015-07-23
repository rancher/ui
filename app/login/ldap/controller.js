import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['login'],
  login: Ember.computed.alias('controllers.login'),
  access: Ember.inject.service(),

  username: null,
  password: null,

  github: Ember.inject.service(),
  infoColor: function() {
    if ( this.get('login.errorMsg') )
    {
      return 'alert-danger';
    }
    {
      return 'alert-warning';
    }
  }.property('login.errorMsg'),

  infoMsg: function() {
    if ( this.get('login.errorMsg') )
    {
      return this.get('login.errorMsg');
    }
    else if ( this.get('login.timedOut') )
    {
      return 'Your session has timed out.  Log in again to continue.';
    }
    else
    {
      return '';
    }
  }.property('login.timedOut','login.waiting','login.errorMsg'),

  actions: {
    authenticate: function() {
      this.set('login.timedOut', false);
      this.set('login.waiting', true);
      this.set('login.errorMsg', null);

      Ember.run.later(() => {
        this.get('access').login(this.get('username')+':'+this.get('password')).then(() => {
          this.transitionTo('authenticated');
        }).catch((err) => {
          this.set('login.errorMsg', err);
        });
      }, 10);
    }
  }
});

