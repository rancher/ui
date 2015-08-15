import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['login'],
  login: Ember.computed.alias('controllers.login'),
  access: Ember.inject.service(),

  username: null,
  password: null,

  github: Ember.inject.service(),

  actions: {
    authenticate: function() {
      this.set('login.timedOut', false);
      this.set('login.waiting', true);
      this.set('login.errorMsg', null);

      Ember.run.later(() => {
        this.get('access').login(this.get('username')+':'+this.get('password')).then(() => {
          this.replaceWith('authenticated');
        }).catch((err) => {
          this.set('login.waiting', false);

          if ( err.status === 401 )
          {
            this.set('login.errorMsg', 'Username or Password incorrect.');
          }
          else
          {
            this.set('login.errorMsg', err.message);
          }
        }).finally(() => {
          this.set('login.waiting', false);
          this.set('password', '');
        });
      }, 10);
    }
  }
});

