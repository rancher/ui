import Resource from '@rancher/ember-api-store/models/resource';
import { reference } from '@rancher/ember-api-store/utils/denormalize';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Resource.extend({
  router:     service(),
  canRemove:  false,
  globalRole: reference('globalRoleId', 'globalRole'),

  canUpdate: computed('links.update', 'groupPrincipalId', function() {
    const { groupPrincipalId, links } = this;

    if (!isEmpty(groupPrincipalId) && !isEmpty(links) && !isEmpty(links.update)) {
      return true;
    }

    return false;
  }),

  availableActions: computed('links.{remove}', function() {
    let out = [
      {
        label:   'action.edit',
        icon:    'icon icon-edit',
        action:  'update',
        enabled: this.canUpdate
      },
    ];

    return out;
  }),

  actions: {
    update() {
      this.router.transitionTo('global-admin.security.accounts.edit-group', this.id);
    }
  },
});
