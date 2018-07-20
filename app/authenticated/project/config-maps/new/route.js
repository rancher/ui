import Route from '@ember/routing/route';
import { get, set } from '@ember/object';

export default Route.extend({
  model(params/* , transition */) {
    if (get(params, 'id')) {
      const record = get(this, 'store').getById('configMap', get(params, 'id'));

      return record.cloneForNew();
    }

    return this.get('store').createRecord({ type: 'configMap' });
  },

  resetController(controller, isExiting/* , transition*/) {
    if (isExiting) {
      set(controller, 'id', null);
      set(controller, 'type', null);
    }
  },
});
