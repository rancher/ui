import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { set, setProperties } from '@ember/object';
import { computed } from '@ember/object';
import C from 'ui/utils/constants';

const HEADERS = [
  {
    translationKey: 'accountsPage.groups.table.groupName',
    name:           'name',
    sort:           ['name'],
  },
  {
    translationKey: 'accountsPage.groups.table.globalRole',
    name:           'globalRoleName',
    sort:           ['globalRole.displayName'],
  },
];

export default Controller.extend({
  access:      service(),
  globalStore: service(),
  intl:        service(),
  growl:       service(),

  sortBy:                   'username',
  refreshing:               false,
  hasRefreshProviderAccess: false,
  errors:                   null,

  headers:    HEADERS,

  actions: {
    refreshAllTokens() {
      set(this, 'refreshing', true);

      this.globalStore.request({
        url:    '/v3/users?action=refreshauthprovideraccess',
        method: 'POST',
        data:   {}
      }).then(() => {
        const successTitle   = this.intl.t('action.refreshAuthProviderAccess.allSuccess.title');
        const successMessage = this.intl.t('action.refreshAuthProviderAccess.allSuccess.message');

        this.growl.success(successTitle, successMessage)
      })
        .catch((err) => {
          set(this, 'errors', [err.message]);
        })
        .finally(() => {
          set(this, 'refreshing', false);
        });
    },
  },

  parsedGroups: computed('model.globalRoleBindings.@each.{state,id,groupPrincipal}', 'model.groupPrincipals.@each.{groupPrincipalId}', function() {
    const { model: { globalRoleBindings, groupPrincipals } } = this;
    // Because we don't create a group when we associate a group with a GRB we have to individually fetch the groups from the auth provider
    // The list that is displayed on this page is a bit of a fudge and when you take an action on a "group" on this page the user will
    // actually take the action on the GRB. So just associate the GRB now and we can take action on this in the component
    const mutatedGroupPricipals = groupPrincipals.map((grp) => {
      if (grp) {
        const filterdGrbs    = globalRoleBindings.filterBy('groupPrincipalId', grp.id).filter( (grb) => {
          return C.REMOVEDISH_STATES.indexOf(grb.state) === -1
        } );
        const mappedGrbNamesIds = filterdGrbs.map((grb) => ({
          groupRoleBindingName: grb.globalRole.displayName,
          groupRoleBindingId:   grb.globalRoleId,
          globalRoleBinding:    grb,
        })).sortBy('groupRoleBindingName');

        if (filterdGrbs.length > 0) {
          setProperties(grp, {
            globalRoleBindings:             filterdGrbs,
            mappedGroupRoleBindingNamesIds: mappedGrbNamesIds,
          });

          return grp;
        }
      }
    });

    return mutatedGroupPricipals.compact();
  }),
});
