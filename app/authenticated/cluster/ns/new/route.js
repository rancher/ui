import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  globalStore: service(),
  clusterStore: service(),
  scope: service(),

  model() {
    const clusterStore = get(this, 'clusterStore');

    const namespace = clusterStore.createRecord({
      type: 'namespace',
      name: '',
      clusterId: get(this,'scope.currentCluster.id'),
    });

    let allProjects = get(this,'globalStore').all('project').filterBy('clusterId', get(this,'scope.currentCluster.id'));

    return {
      namespace,
      allProjects
    };
  },
});
