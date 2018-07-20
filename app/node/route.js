import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),

  model(params) {
    return get(this, 'globalStore').find('node', params.node_id)
      .then((node) => ({
        node,
        nodes: [node],
      }));
  },
});
