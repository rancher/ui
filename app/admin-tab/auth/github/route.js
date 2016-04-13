import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  model: function() {
    return this.get('userStore').find('githubconfig', null, {forceReload: true}).then(function(collection) {
      return collection.get('firstObject');
    });
  },

  setupController: function(controller, model) {
    controller.setProperties({
      model: model.clone(),
      originalModel: model,
      confirmDisable: false,
      saving: false,
      testing: false,
      wasShowing: false,
      organizations: this.get('session.orgs')||[],
      error: null,
      isEnterprise: (model.get('hostname') ? true : false),
    });

    controller.set('saved',true);
  }
});
