import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';
import C from 'ui/utils/constants';

export default Resource.extend({
  type: 'roleTemplate',
  router: service(),

  state: computed('enabled', function() {
    return get(this, 'enabled') ? 'active' : 'inactive';
  }),

  isCustom: computed('roleTemplateId', function() {
    return !C.BASIC_ROLE_TEMPLATE_ROLES.includes(get(this, 'id'));
  }),

  displayName: computed('name','id', function() {
    let name = get(this, 'name');
    if ( name ) {
      return name;
    }

    return '(' + get(this,'id') + ')';
  }),

  actions: {
    edit: function() {
      this.get('router').transitionTo('global-admin.security.roles.edit', this.get('id'));
    },
  },

  canEdit: computed('links.update', 'builtin', function() {
    return !!get(this, 'links.update') && !get(this,'builtin');
  }),

  canRemove: computed('links.remove', 'builtin', function() {
    return !!get(this, 'links.remove') && !get(this,'builtin');
  }),
});
