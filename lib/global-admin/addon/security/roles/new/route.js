import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore:         service(),
  roleTemplateService: service('roleTemplate'),
  model( params ) {
    const store = get(this, 'globalStore');

    return hash({
      policies: store.find('podSecurityPolicyTemplate'),
      roles:    get(this, 'roleTemplateService').fetchFilteredRoleTemplates(null, null),
    }).then( (res) => {
      const id = get(params, 'id');
      let role;

      if ( id ) {
        role = res.roles.findBy('id', id);

        if ( !role ) {
          this.replaceWith('security.roles.index');
        }

        role = role.cloneForNew() ;
        delete role['builtin'];
        delete role['annotations'];
        delete role['labels'];
        delete role['links'];
      } else {
        role = store.createRecord({
          type:    'roleTemplate',
          context: get(params, 'context') || 'project',
          name:    '',
          rules:   [],
          hidden:  false,
          locked:  false,
        });
      }

      set(res, 'role', role);

      return res;
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    setProperties(controller, { type: get(model, 'role.context') });
  },
  queryParams:         { context: { refreshModel: false } },

});
