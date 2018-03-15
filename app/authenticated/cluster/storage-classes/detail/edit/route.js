import Route from '@ember/routing/route';
import { set } from '@ember/object';

export default Route.extend({
  model() {
    const original = this.modelFor('authenticated.cluster.storage-classes.detail');
    return original.clone();
  },
});
