import { setProperties } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      setProperties(controller, {
        search: '',
        istio:  false,
      })
    }
  },
});
