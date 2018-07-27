import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  roleTemplateService: service('roleTemplate'),
  globalStore:         service(),

  model(/* params */) {
    return hash({
      roleTemplates: get(this, 'roleTemplateService.allVisibleRoleTemplates'),
      globalRoles:   get(this, 'globalStore').find('globalRole'),
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    controller.set('model', model);

    controller.setContent();
  },
  queryParams:         { context: { refreshModel: true } },

});
