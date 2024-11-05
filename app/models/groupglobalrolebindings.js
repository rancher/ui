import Resource from 'ember-api-store/models/resource';
import { computed, set } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

// THIS IS A FAKE RESOURCE
// It exists purely to handle the weirdness around global role bindings with a group id. We need this fake model for the actions on the account group row.
// Since we don't create a group when we create a globalRoleBinding when we list the bindings for a group we map them down into a collection of id's
// in order to take action on those Id's we need to keep them around some how. Rather then modify the principal belonging to the group and risk permaenntly updating that somehow
// I created this dumb model that is basically a fake group and collectes the globalRoleBinding Id's and groupPrincipalId. This gets passed as the model to the actions-menu.
export default Resource.extend({
  growl:                service(),
  router:               service(),
  globalStore:          service(),
  modalService:         service('modal'),

  type: 'groupGloblaRoleBindings',

  globalRoleBindingIds: null,
  groupPrincipalId:     null,
  canRemove:            false,

  init() {
    this._super(...arguments);

    if (!this.globalRoleBindingIds) {
      set(this, 'globalRoleBindingIds', []);
    }
  },

  canUpdate: computed('globalRoleBindingIds', 'groupPrincipalId', function() {
    const { groupPrincipalId, globalRoleBindingIds } = this;

    if (!isEmpty(groupPrincipalId) && !isEmpty(globalRoleBindingIds)) {
      return true;
    }

    return false;
  }),

  availableActions: computed('canUpdate', 'globalRoleBindingIds', 'groupPrincipalId', function() {
    let out = [
      {
        label:   'action.edit',
        icon:    'icon icon-edit',
        action:  'update',
        enabled: this.canUpdate
      },
      {
        label:     'action.remove',
        icon:      'icon icon-trash',
        action:    'remove',
        altAction: 'bypassConfirmDelete',
        enabled:   this.canUpdate
      },
    ];

    return out;
  }),

  actions: {
    update() {
      this.router.transitionTo('global-admin.security.accounts.edit-group', this.groupPrincipalId);
    },
    remove() {
      this.modalService.toggleModal('modal-delete-group-role-bindings', { model: this });
    },
    bypassConfirmDelete(cb) {
      this.removeRoleBindings(cb);
    }
  },

  removeRoleBindings(cb) {
    const { mappedGroupRoleBindingNamesIds = [] } = this;
    const promises                         = [];
    const globalRoleBindings               = mappedGroupRoleBindingNamesIds.filterBy('globalRoleBinding').mapBy('globalRoleBinding');

    if (!isEmpty(globalRoleBindings) && globalRoleBindings.length > 0) {
      globalRoleBindings.forEach((grb) => {
        const prom = this.globalStore.rawRequest({
          url:    grb.links.remove,
          method: 'DELETE',
        });

        promises.push(prom);
      });
    }

    return all(promises).then((resp) => {
      this.growl.success('Success', `You've successfully removed the global role ${ this.groupPrincipalName }`);

      if (cb) {
        return cb(resp);
      }

      return resp;
    }).catch((err) => {
      if (cb) {
        return cb(err);
      }

      return err;
    });
  },
});
