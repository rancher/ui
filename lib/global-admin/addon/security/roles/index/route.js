import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Route.extend({
  roleTemplateService: service('roleTemplate'),

  model() {

    return get(this, 'roleTemplateService').fetchFilteredRoleTemplates(null, null);

  },
});
