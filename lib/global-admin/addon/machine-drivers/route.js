import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  catalog: service(),
  globalStore: service(),

  model() {
    return hash({
      drivers: this.get('globalStore').find('machinedriver', null, {forceReload: true, filter: {active: true}}),
      catalogDrivers: this.get('catalog').fetchTemplates({templateBase: 'machine', category: 'all', allowFailure: true}),
    }).then((hash) => {
      return hash;
    });
  },
});
