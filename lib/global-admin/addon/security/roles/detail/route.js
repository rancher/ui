import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, setProperties } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),

  model(params) {
    const store = get(this, 'globalStore');

    let role    = null;

    if (get(params, 'type') && get(params, 'type') === 'global') {
      role = get(this, 'globalStore').find('globalRole', get(params, 'role_id'));
    } else {
      role = get(this, 'roleTemplateService').fetchFilteredRoleTemplates(params.role_id);
    }

    return hash({
      policies: store.find('podSecurityPolicyTemplate'),
      role,
      roles:    get(this, 'roleTemplateService').fetchFilteredRoleTemplates(null, null),
    }).then((hash) => {
      return {
        policies: hash.policies,
        role:     hash.role.clone(),
        roles:    hash.roles,
      };
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    let type = '';

    if (get(model, 'role.type') === 'globalRole') {
      type = 'global';
    } else if (get(model, 'role.context') === 'project') {
      type = 'project'
    } else if (get(model, 'role.context') === 'cluster') {
      type = 'cluster'
    }

    setProperties(controller, {
      type,
      readOnly: true
    });
  },
  queryParams: { type: { refreshModel: true } },

});
