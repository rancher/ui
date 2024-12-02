import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

export default Resource.extend({
  router:              service(),
  roleTemplateService: service('roleTemplate'),
  growl:               service(),

  type:     'roleTemplate',
  canClone: true,

  state: computed('locked', function() {
    return this.locked ? 'locked' : 'active';
  }),

  isCustom: computed('id', 'roleTemplateId', function() {
    return !C.BASIC_ROLE_TEMPLATE_ROLES.includes(this.id);
  }),

  displayName: computed('name', 'id', function() {
    let name = this.name;

    if ( name ) {
      return name;
    }

    return `(${  this.id  })`;
  }),

  canRemove: computed('links.remove', 'builtin', function() {
    return !!get(this, 'links.remove') && !this.builtin;
  }),
  actions: {
    edit() {
      this.router.transitionTo('global-admin.security.roles.edit', this.id);
    },

    clone() {
      this.router.transitionTo('global-admin.security.roles.new', {
        queryParams: {
          id:      this.id,
          context: this.context
        }
      });
    }
  },

  delete() {
    const self = this;
    const sup = self._super;
    const roleTemplateService = this.roleTemplateService
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
        return this.growl.error(this.intl.t('rolesPage.index.errors.inherited', {
          displayName: this.displayName,
          roleNames:   roleNames.join(','),
        }));
      }
    });
  },

});
