import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import EmberObject from '@ember/object';
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),
  model() {
    var globalStore = get(this, 'globalStore');
    var pipeline = globalStore.createRecord({ type: 'pipeline' });

    return EmberObject.create({ pipeline });
  }
});