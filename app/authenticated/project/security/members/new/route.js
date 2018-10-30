import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),

  model() {
    const gs  = get(this, 'globalStore');
    const pid = this.paramsFor('authenticated.project');

    return hash({
      project:      gs.find('project', pid.project_id, { forceReload: true }),
      roles:        get(this, 'roleTemplateService').get('allFilteredRoleTemplates'),
      roleBindings: gs.findAll('projectRoleTemplateBinding'),
    });
  }
});
