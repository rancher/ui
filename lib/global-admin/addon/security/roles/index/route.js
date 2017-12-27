import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model() {
    return this.get('globalStore').find('roleTemplate', null, {
      forceReload: true,
      removeMissing: true,
      filter: {
        hidden: false
      }
    });
  },
});
