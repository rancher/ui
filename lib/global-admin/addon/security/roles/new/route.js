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
      policies:    store.find('podSecurityPolicyTemplate'),
      roles:       get(this, 'roleTemplateService').fetchFilteredRoleTemplates(null, null),
      globalRoles: store.find('globalRole'),
    }).then( (res) => {
      const { id, context = 'project' } = params;
      let role;

      if ( id ) {
        if (context === 'global') {
          role = res.globalRoles.findBy('id', id);
        } else {
          role = res.roles.findBy('id', id);
        }

        if ( !role ) {
          this.replaceWith('security.roles.index');
        }

        role = role.cloneForNew() ;

        set(role, 'context', context);

        delete role['builtin'];
        delete role['annotations'];
        delete role['labels'];
        delete role['links'];
      } else {
        if (context === 'global') {
          role = store.createRecord({
            type:           'globalRole',
            context
          });
        } else {
          role = store.createRecord({
            type:    'roleTemplate',
            name:    '',
            rules:   [],
            hidden:  false,
            locked:  false,
            context
          });
        }
      }

      set(res, 'role', role);

      return res;
    });
  },

  setupController(controller, model) {
    this._super(...arguments);

    setProperties(controller, { type: get(model, 'role.context') });
  },

  queryParams:         {
    context: { refreshModel: true },
    id:      { refreshModel: true }
  },

});
