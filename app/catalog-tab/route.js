import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  access:  service(),
  catalog: service(),
  scope:   service(),

  beforeModel() {
    this._super(...arguments);

    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  model() {
    // Do not use the model result
    const out = {};

    return get(this, 'catalog').fetchTemplates().then(() => out);
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      controller.setProperties({ category: '' })
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
});
