import Route from '@ember/routing/route';
import { inject as service } from "@ember/service";
import { get } from '@ember/object';

export default Route.extend({
  globalStore: service(),

  model(params) {
    return get(this,'globalStore').find('cluster', params.cluster_id);
  },
});
