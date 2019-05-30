import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default Route.extend({
  catalog: service(),

  beforeModel() {
    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  model(params) {
    const store = get(this, 'store');

    return store.find('app', get(params, 'rule_id'));
  },

  afterModel(model) {
    return get(this, 'catalog').fetchAppTemplates([model]);
  },
});

