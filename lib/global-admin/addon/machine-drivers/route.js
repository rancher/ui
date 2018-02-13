import { hash } from 'rsvp';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  catalog: service(),
  globalStore: service(),

  model() {
    return hash({
      drivers: this.get('globalStore').findAll('nodeDriver'),
      catalogDrivers: this.get('catalog').fetchTemplates({templateBase: 'node', category: 'all', allowFailure: true}),
    }).then((hash) => {
      return hash;
    });
  },
});
