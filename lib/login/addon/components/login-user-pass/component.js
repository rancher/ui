import Ember from 'ember';

export default Ember.Component.extend({
  access: Ember.inject.service(),
  isCaas: Ember.computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
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

