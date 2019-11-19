import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

export default Route.extend({
  globalStore:              service(),
  hasRefreshProviderAccess: false,

  model() {
    return get(this, 'globalStore').findAll('user');
  },

  afterModel() {
    return this.globalStore.rawRequest({
      url:    `users?limit=0`,
      method: 'GET',
    }).then((users) => {
      if (get(users, 'body.actions.refreshauthprovideraccess')) {
        set(this, 'hasRefreshProviderAccess', true);
      }

      return;
    })
  },

  setupController(controller, model) {
    if (get(this, 'hasRefreshProviderAccess')) {
      controller.set('hasRefreshProviderAccess', true);
    }

    this._super(controller, model);
  }
});
