import { on } from '@ember/object/evented';
import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import C from 'ui/utils/constants';

export default Route.extend({
  model() {
    var store = get(this, 'store');

    return store.findAll('horizontalpodautoscaler')
      .then((hpas) => {
        return {
          data:      hpas,
          supported: true
        }
      })
      .catch(() => {
        return {
          data:      [],
          supported: false
        }
      });
  },

  setDefaultRoute: on('activate', function() {
    set(this, `session.${ C.SESSION.PROJECT_ROUTE }`, 'authenticated.project.hpa');
  }),
});
