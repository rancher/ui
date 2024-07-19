import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';
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
