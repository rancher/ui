import { get } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  globalStore: service(),
  scope:       service(),

  model(params) {
    return get(this, 'globalStore').find('node', params.node_id)
      .then((node) => ({
        node,
        nodes: [node],
      }));
  },

  actions: {
    goToGrafana(grafanaUrl) {
      window.open(grafanaUrl, '_blank');
    }
  }
});
