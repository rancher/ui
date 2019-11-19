import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    return this.globalStore.findAll('globalrole').then((resp) => {
      const { globalRoles } = resp;

      return {
        globalRoleBinding: this.globalStore.createRecord({ type: 'globalrolebinding', }),
        globalRoles,
      };
    });
  },

});
