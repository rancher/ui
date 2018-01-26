import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Resource from 'ember-api-store/models/resource';

const ROLE_BASE = ['cluster-owner', 'cluster-member', 'project-owner', 'project-member'];

export default Resource.extend({
  type: 'roleTemplate',
  router: service(),
  isCustom: computed('roleTemplateId', function() {
    return !ROLE_BASE.includes(get(this, 'id'));
  }),

  actions: {
    edit: function() {
      this.get('router').transitionTo('global-admin.security.roles.edit', this.get('id'));
    },
  },

  availableActions: function () {
    const builtIn = get(this,'builtin') === true;

    return [
      { label: 'action.edit', icon: 'icon icon-edit', action: 'edit', enabled: !builtIn },
      { divider: true },
      { label: 'action.remove', icon: 'icon icon-trash', action: 'promptDelete', enabled: !builtIn, altAction: 'delete', bulkable: true },
      { divider: true },
      { label: 'action.viewInApi', icon: 'icon icon-external-link', action: 'goToApi', enabled: true },
    ];
  }.property('builtin'),
});
