import Ember from 'ember';
import CatalogResource from 'ui/mixins/catalog-resource';

export default Ember.Route.extend(CatalogResource, {
  model() {
    return Ember.RSVP.hash({
      drivers: this.get('userStore').findAll('machinedriver', null, {forceReload: true}),
      catalogDrivers: this.getCatalogs({templateBase: 'machine', category: 'all'}),
    }).then((hash) => {
      return hash;
    });
  },
});
