import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
  catalog: service(),

  model() {
    return hash({
      clusterCatalogs: this.catalog.fetchCatalogs('clusterCatalog'),
      globalCatalogs:  this.catalog.fetchCatalogs()
    });
  },
});
