import Ember from 'ember';

export default Ember.Route.extend({
  samlAuth: Ember.inject.service(),
  queryParams: {
    samlTest: {
      refreshModel:false
    }
  },
  model: function(params/*, transition*/) {
    if (params.samlTest) {
      reply(null);
    } else {
      if (this.get('samlAuth.hasToken')) {
        this.transitionTo('authenticated');
      } else {
        this.transitionTo('login');
      }

    }

    function reply(err) {
      try {
        window.opener.window.onSAMLTest(err);
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
