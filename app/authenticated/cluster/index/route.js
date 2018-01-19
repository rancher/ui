import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model: function () {
    return this.get('globalStore').findAll('machine').then((nodes) => {
      const cluster = this.modelFor('authenticated.cluster');

      return {
        cluster,
        nodes,
      };
    });
  },
});
