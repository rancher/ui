import Ember from 'ember';

export default Ember.Route.extend({
  shibbolethAuth: Ember.inject.service(),
  queryParams: {
    shibbolethTest: {
      refreshModel:false
    }
  },
  model: function(params/*, transition*/) {
    if (params.shibbolethTest) {
      reply(null);
    } else {
      if (this.get('shibbolethAuth.hasToken')) {
        this.transitionTo('authenticated');
      } else {
        this.transitionTo('login');
      }

    }

    function reply(err) {
      try {
        window.opener.window.onShibbolethTest(err);
        Ember.run.later(() => {
          window.close();
        },250);
      } catch(e) {
        window.close();
      }
    }
  },
  setupController: function(controller) {
    controller.set('settings', Ember.inject.service('settings'));
  },

});
