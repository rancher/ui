import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { set, get } from '@ember/object';

export default Route.extend({
  catalog: service(),

  model() {
    return get(this, 'catalog').fetchUnScopedCatalogs();
  },

  resetController(controller, isExiting /* , transition*/ ) {
    if (isExiting) {
      set(controller, 'istio', false);
    }
  },
});
