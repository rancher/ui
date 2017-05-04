import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function() {
    this.transitionTo('authenticated.project.apikeys.account');
  }
});
