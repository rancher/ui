import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  catalog: service(),
  store:   service(),

  model() {
    return this.get('store').findAll('app').then((apps) => {
      return {
        apps,
      };
    });

  },

  afterModel(model/* , transition */) {
    return get(this, 'catalog').fetchAppTemplates(get(model, 'apps'));
  }
});
