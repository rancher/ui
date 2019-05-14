import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  access:      service(),
  globalStore: service(),
  intl:        service(),
  growl:       service(),

  sortBy:                   'username',
  refreshing:               false,
  hasRefreshProviderAccess: false,
  errors:                   null,

  headers:    [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      translationKey: 'generic.name',
      name:           'name',
      sort:           ['name'],
    },
    {
      translationKey: 'generic.id',
      name:           'id',
      sort:           ['id'],
    },
    {
      translationKey: 'accountsPage.index.table.username',
      name:           'username',
      sort:           ['username'],
    },
  ],

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
});
