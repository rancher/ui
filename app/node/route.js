import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),

  model: function (params) {
    return get(this, 'globalStore').find('machine', params.node_id).then((node) => {
      return {
        node,
        nodes: [node],
      };
    });
  },
});
