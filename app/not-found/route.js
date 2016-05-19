import Ember from 'ember';

export default Ember.Route.extend({
  language  : Ember.inject.service('user-language'),

  beforeModel: function() {
    return this.get('language').initLanguage();
  },

  redirect: function() {
    let url = this.router.location.formatURL('/not-found');
    if (window.location.pathname !== url) {
      this.transitionTo('not-found');
    }
  }
});
