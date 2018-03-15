import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  model(params) {
    const store = get(this, 'clusterStore');
    return store.find('storageClass', params.storage_class_id)
  },
});
