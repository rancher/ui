import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  clusterStore: service(),
  scope: service(),

  model: function() {
    return this.get('clusterStore').find('node').then((nodes) => {
      return {
        nodes,
      };
    });
  },
});
