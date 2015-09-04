import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),

  waiting: null,
  userLabel: 'Username',
  userPlaceholder: 'e.g. jsmith',
  loginLabel: 'Log In',
  loggingInLabel: 'Logging In...',

  username: null,
  password: null,

  actions: {
    authenticate: function() {
      var code = this.get('username')+':'+this.get('password');
      this.set('password','');
      this.sendAction('action', code);
    }
  }
});

