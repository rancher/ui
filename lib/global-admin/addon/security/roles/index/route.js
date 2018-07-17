import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  roleTemplateService: service('roleTemplate'),
  globalStore:         service(),

  model() {

    return hash({
      roleTemplates: get(this, 'roleTemplateService').fetchFilteredRoleTemplates(null, null),
      globalRoles:   get(this, 'globalStore').find('globalRole'),
    });
  },

  setupController(controller, model) {

    this._super(...arguments);
    controller.set('filterableContent', get(model, 'globalRoles'));
    // controller.set('model', model);

  }
});
