import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default Route.extend({
  globalStore: service(),

  model(params) {
    return hash({
      globalRoleBindings: this.globalStore.find('globalrolebinding', null, { filter: { groupPrincipalId: params.role_id } }), // no find all cause its a live array
      globalRoles:        this.globalStore.findAll('globalrole'),
      principal:          this.globalStore.find('principal', params.role_id)
    });
  },

});
