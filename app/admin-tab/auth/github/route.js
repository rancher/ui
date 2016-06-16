import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get('userStore').find('githubconfig', null, {forceReload: true}).then(function(collection) {
      return collection.get('firstObject');
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model,
      confirmDisable: false,
      testing: false,
      organizations: this.get('session.orgs')||[],
      errors: null,
      isEnterprise: (model.get('hostname') ? true : false),
    });

    controller.set('saved',true);
  }
});
