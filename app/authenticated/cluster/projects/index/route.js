import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  scope: service(),

  model() {
    return get(this, 'globalStore').findAll('project', { filter: { clusterId: this.get('scope.currentCluster.id') } }).then(projects => {
      return {
        projects
      };
    });
  },
});
