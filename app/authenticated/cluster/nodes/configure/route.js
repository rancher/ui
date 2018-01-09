import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    return get(this, 'globalStore').find('machinedriver', null, {filter: {active: true}}).then( ( drivers ) => {
      return {availableDrivers: drivers};
    });
  },
});
