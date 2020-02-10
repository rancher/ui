import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Preload from 'ui/mixins/preload';
import { reject, all as PromiseAll } from 'rsvp';
import C from 'ui/utils/constants';

const VALID_ROUTES = ['authenticated.cluster.nodes', 'authenticated.cluster.storage.classes',
  'authenticated.cluster.storage.persistent-volumes', 'authenticated.cluster.notifier',
  'authenticated.cluster.alert', 'authenticated.cluster.logging', 'authenticated.cluster.monitoring',
  'authenticated.cluster.security.members.index', 'authenticated.cluster.projects',
  'authenticated.cluster.quotas', 'authenticated.cluster.istio'];

export default Route.extend(Preload, {
  scope:        service(),
  globalStore:  service(),
  clusterStore: service(),
  modalService: service('modal'),

  model(params, transition) {
    return get(this, 'globalStore').find('cluster', params.cluster_id)
      .then((cluster) => get(this, 'scope').startSwitchToCluster(cluster)
        .then(() => {
          if ( get(cluster, 'isReady') ) {
            return this.loadSchemas('clusterStore').then(() => PromiseAll([
              this.preload('clusterScan', 'globalStore'),
              this.preload('namespace', 'clusterStore'),
              this.preload('storageClass', 'clusterStore'),
              this.preload('persistentVolume', 'clusterStore'),
            ]).then(() => cluster));
          } else {
            return cluster;
          }
        })
        .catch((err) => {
        // @TODO-2.0 right now the API can't return schemas for a not-active cluster
          if ( err.status === 404 ) {
            return cluster;
          } else {
            return reject(err);
          }
        }))
      .catch((err) => this.loadingError(err, transition));
  },

  afterModel(model) {
    return get(this, 'scope').finishSwitchToCluster(model);
  },

  redirect(router, transition) {
    let route = this.get(`session.${ C.SESSION.CLUSTER_ROUTE }`);

    if ( transition.targetName === 'authenticated.cluster.index' && VALID_ROUTES.includes(route) ) {
      this.replaceWith(route);
    }
  },
  actions: {
    becameReady() {
      get(this, 'clusterStore').reset();
      this.refresh();
    },

    importYaml() {
      this.modalService.toggleModal('modal-import', {
        escToClose:  true,
        clusterOnly: true,
      });
    },
  },

});
