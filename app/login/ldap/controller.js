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
          this.transitionTo('authenticated');
        }).catch((err) => {
          this.set('login.errorMsg', err);
        });
      }, 10);
    }
  }
});

