import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  clusterStore: service(),
  scope: service(),

  model() {
    const store = get(this, 'clusterStore');

    const namespace = store.createRecord({
      type: 'namespace',
      name: '',
      clusterId: get(this,'scope.currentCluster.id'),
    });

    let allProjects = this.get('globalStore').all('project').filterBy('clusterId', this.get('scope.currentCluster.id'));

    return {
      namespace,
      allProjects
    };
  },
});
