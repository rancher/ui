import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  catalog: service(),

  model() {
    return get(this, 'catalog').fetchCatalogs();
  },
  actions: {
    refresh() {
      this.refresh();
    }
  },

});
