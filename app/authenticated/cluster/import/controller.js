import { cancel, later } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Controller, { inject as controller } from '@ember/controller';

export default Controller.extend({
  scope: service(),
  settings: service(),
  clusterController: controller('authenticated.cluster'),
  cluster: alias('clusterController.model'),

  loading: alias('cluster.isTransitioning'),
  registrationCommand: alias('cluster.registrationToken.clusterCommand'),

  refreshTimer: null,
  init() {
    this._super(...arguments);
    let cluster = this.get('cluster');
    if(cluster.state!=="inactive"){
        this.send('cancel');
    }
    this.scheduleRefresh();
  },

  willDestroyElement() {
    this.cancelRefresh();
  },

  cancelRefresh() {
    cancel(this.get('refreshTimer'));
  },

  scheduleRefresh() {
    this.cancelRefresh();
    this.set('refreshTimer', later(this, 'refreshCluster', 5000));
  },

  refreshCluster() {
    let cluster = this.get('cluster');
    cluster.reload().then(() => {
      if ( cluster.get('state') === 'inactive' ) {
        this.scheduleRefresh();
      } else {
        let project = this.get('scope.current');
        if ( project.get('clusterId') !== cluster.get('id') ) {
          project = cluster.get('defaultProject');
        }

        if ( project ) {
          this.send('switchProject', project.get('id'), 'hosts', [project.get('id')]);
        } else {
          this.send('cancel');
        }
      }
    }).catch(() => {
      this.scheduleRefresh();
    });
  },

  actions: {
    hostSet() {
      this.set('model.apiHostSet', true);
    },

    cancel() {
      this.transitionToRoute('global-admin.clusters');
    }
  },

  configSet: function() {
    return (this.get('kubeconfig')||'').includes('clusters:');
  }.property('kubeconfig'),
});
