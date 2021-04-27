import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

export default Route.extend({
  access:  service(),
  catalog: service(),
  scope:   service(),

  beforeModel() {
    this._super(...arguments);

    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  model(params, transition) {
    // Do not use the model result
    const out = {};

    if (get(transition, 'targetName') === 'catalog-tab.index') {
      return get(this, 'catalog').fetchTemplates().then(() => out);
    }

    return out;
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      set(controller, 'category', '');
    }
  },

  actions: {
    refresh() {
      this.refresh();
    },
  },
});
