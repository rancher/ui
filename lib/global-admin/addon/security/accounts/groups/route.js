import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';
import { allSettled } from 'rsvp';

export default Route.extend({
  globalStore:              service(),
  hasRefreshProviderAccess: false,

  beforeModel() {
    return this.globalStore.findAll('globalrolebinding');
  },

  model() {
    const globalRoleBindings = this.globalStore.all('globalrolebinding').filterBy('groupPrincipalId');
    const promises = [];
    const uniqGroupPrincipalIds = globalRoleBindings.mapBy('groupPrincipalId').uniq();

    uniqGroupPrincipalIds.forEach((grb) => {
      promises.push(this.globalStore.find('principal', grb));
    });

    return allSettled(promises).then((resp) => {
      const groupPrincipals = resp.filterBy('state', 'fulfilled').mapBy('value');

      return {
        globalRoleBindings,
        groupPrincipals
      };
    });
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
    });
  },

  setupController(controller, model) {
    if (get(this, 'hasRefreshProviderAccess')) {
      controller.set('hasRefreshProviderAccess', true);
    }

    this._super(controller, model);
  }
});
