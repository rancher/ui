import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  access:  service(),
  catalog: service(),
  scope:   service(),

  beforeModel() {
    this._super(...arguments);

    return get(this, 'catalog').fetchUnScopedCatalogs().then((hash) => {
      this.set('catalogs', hash);
    });
  },

  model(params) {
    return get(this, 'catalog').fetchTemplates(params)
      .then((res) => {
        res.catalogs = get(this, 'catalogs');

        return res;
      });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      controller.setProperties({
        category:         '',
        catalogId:        '',
        projectCatalogId: '',
        clusterCatalogId: '',
      })
    }
  },

  deactivate() {
    // Clear the cache when leaving the route so that it will be reloaded when you come back.
    this.set('cache', null);
  },

  actions: {
    refresh() {
      // Clear the cache so it has to ask the server again
      this.set('cache', null);
      this.refresh();
    },
  },

  queryParams: {
    category:         { refreshModel: true },
    catalogId:        { refreshModel: true },
    clusterCatalogId: { refreshModel: true },
    projectCatalogId: { refreshModel: true },
  },

});
