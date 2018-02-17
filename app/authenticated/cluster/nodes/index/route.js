import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model: function() {
    const cluster = this.modelFor('authenticated.cluster');
    return this.get('globalStore').findAll('node').then((nodes) => {
      return {
        cluster,
        nodes,
      };
    });
  },
});
