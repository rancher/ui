import { get } from '@ember/object';
import { hash } from 'rsvp';
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

    return hash({
      namespace,
      namespaces: get(this, 'clusterStore').findAll('namespace'),
      allProjects: get(this,'globalStore').all('project').filterBy('clusterId', get(this,'scope.currentCluster.id')),
    });
  },

  resetController: function (controller, isExiting/*, transition*/) {
    if (isExiting)
    {
      controller.set('errors', null);
    }
  }
});
