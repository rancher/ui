import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model() {
    const cluster = this.modelFor('authenticated.cluster');

    return get(this, 'globalStore').find('machinedriver', null, { filter: { active: true } }).then((drivers) => {
      return EmberObject.create({
        availableDrivers: drivers,
        cluster
      });
    });
  },
});
