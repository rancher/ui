import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from '@rancher/ember-api-store/models/resource';
import C from 'ui/utils/constants';

export default Resource.extend({
  router:              service(),
  roleTemplateService: service('roleTemplate'),
  growl:               service(),

  type:     'roleTemplate',
  canClone: true,

  state: computed('locked', function() {
    return get(this, 'locked') ? 'locked' : 'active';
  }),

  isCustom: computed('roleTemplateId', function() {
    return !C.BASIC_ROLE_TEMPLATE_ROLES.includes(get(this, 'id'));
  }),

  displayName: computed('name', 'id', function() {
    let name = get(this, 'name');

    if ( name ) {
      return name;
    }

    return `(${  get(this, 'id')  })`;
  }),

  canRemove: computed('links.remove', 'builtin', function() {
    return !!get(this, 'links.remove') && !get(this, 'builtin');
  }),
  actions: {
    edit() {
      get(this, 'router').transitionTo('global-admin.security.roles.edit', get(this, 'id'));
    },

    clone() {
      get(this, 'router').transitionTo('global-admin.security.roles.new', {
        queryParams: {
          id:      get(this, 'id'),
          context: get(this, 'context')
        }
      });
    }
  },

  delete() {
    const self = this;
    const sup = self._super;
    const roleTemplateService = get(this, 'roleTemplateService')
    let canDelete = true
    const roleNames = []

    return roleTemplateService.fetchFilteredRoleTemplates().then((res) => {
      const roleTemplates = res.filter((r) => r.canRemove)

      roleTemplates.map((r) => {
        const { roleTemplateIds = [] } = r;

        (roleTemplateIds || []).map((id) => {
          if (id === this.id) {
            canDelete = false
            roleNames.pushObject(r.name)
          }
        })
      })

      if (canDelete) {
        return sup.apply(self, arguments);
      } else {
        return get(this, 'growl').error(get(this, 'intl').t('rolesPage.index.errors.inherited', {
          displayName: get(this, 'displayName'),
          roleNames:   roleNames.join(','),
        }));
      }
    })
  },

});
