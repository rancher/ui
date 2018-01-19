import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  scope: service(),

  redirect() {
    // @TODO-2.0 go to appropriate place based on permissions
    this.replaceWith('global-admin.clusters');
  },
});
