import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),

  model(params) {
    const store = get(this, 'globalStore');

    return store.find('resourceQuotaTemplate', params.quota_template_id);
  },
});