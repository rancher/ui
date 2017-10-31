import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('authStore').find('config', null, {forceReload: true}).then(function(collection) {
      return collection;
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: this.get('session.orgs')||[],
      errors: null,
      isEnterprise: (model.get('githubConfig.hostname') ? true : false),
      secure: model.get('githubConfig.schema') === 'https://'
    });

    controller.set('saved',true);
  }
});
