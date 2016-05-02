import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),

  waiting: null,

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

