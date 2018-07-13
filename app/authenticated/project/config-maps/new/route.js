import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params/* , transition */) {

    if (get(params, 'id')) {

      const record = get(this, 'store').getById('configMap', get(params, 'id'));

      return record.cloneForNew();

    }

    return this.get('store').createRecord({ type: 'configMap' });

  },
});
