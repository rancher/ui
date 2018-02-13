import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  model: function() {
    return get(this, 'globalStore').find('authconfig', 'github');
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
