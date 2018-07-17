import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),

  model(params) {
    const store = get(this, 'globalStore');

    return hash({
      policies: store.find('podSecurityPolicyTemplate'),
      role:     get(this, 'roleTemplateService').fetchFilteredRoleTemplates(params.role_id),
      roles:    get(this, 'roleTemplateService').fetchFilteredRoleTemplates(),
    }).then((hash) => {

      return EmberObject.create({
        policies: hash.policies,
        role:     hash.role.clone(),
        roles:    hash.roles,
      });
    });
  },
});
