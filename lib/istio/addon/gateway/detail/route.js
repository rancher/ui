import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    const store = get(this, 'store');

    return store.find('gateway', params.id);
  },
});
