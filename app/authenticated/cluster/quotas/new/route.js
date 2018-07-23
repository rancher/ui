import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  model() {
    const store = get(this, 'globalStore');
    const cluster = this.modelFor('authenticated.cluster');

    const resourceQuotaTemplate = store.createRecord({
      type:      'resourceQuotaTemplate',
      name:      '',
      clusterId: get(cluster, 'id'),
    });

    return resourceQuotaTemplate;
  },
});
