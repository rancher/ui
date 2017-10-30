import Ember from 'ember';

export default Ember.Component.extend({
  github: Ember.inject.service(),

  actions: {
    authenticate() {
      this.sendAction('action');
      Ember.run.later(() => {
        this.get('github').authorizeRedirect();
      }, 10);
    }
  }
});

