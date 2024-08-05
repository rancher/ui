import { hash } from 'rsvp';
import { set, get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore:         service(),
  access:              service(),
  roleTemplateService: service('roleTemplate'),

  model(params) {
    const store = this.globalStore;

    return hash({
      me:                          get(this, 'access.principal'),
      project:                     store.find('project', params.project_id),
      projectRoleTemplateBindings: store.find('projectRoleTemplateBinding'),
      projects:                    store.findAll('project'),
      roles:                       this.roleTemplateService.get('allFilteredRoleTemplates'),
      users:                       store.find('user', null, { forceReload: true }),
    }).then((hash) => {
      set(hash, 'project', get(hash, 'project').clone());

      return hash;
    });
  },
});
