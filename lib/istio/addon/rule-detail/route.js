import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { hash } from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend({
  catalog: service(),

  beforeModel() {
    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  model(params) {
    const store = get(this, 'store');

    return hash({ rule: store.find('app', get(params, 'rule_id')), });
  },

  afterModel(model) {
    return get(this, 'catalog').fetchAppTemplates([get(model, 'rule')]);
  },
});

