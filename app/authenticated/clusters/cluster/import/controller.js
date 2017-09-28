import Ember from 'ember';

export default Ember.Controller.extend({
  projects: Ember.inject.service(),
  settings: Ember.inject.service(),
  clusterController: Ember.inject.controller('authenticated.clusters.cluster'),
  cluster: Ember.computed.alias('clusterController.model'),

  loading: Ember.computed.alias('cluster.isTransitioning'),
  registrationCommand: Ember.computed.alias('cluster.registrationToken.clusterCommand'),

  refreshTimer: null,
  init() {
    this._super(...arguments);
    this.scheduleRefresh();
  },

  willDestroyElement() {
    this.cancelRefresh();
  },

  cancelRefresh() {
    Ember.run.cancel(this.get('refreshTimer'));
  },

  scheduleRefresh() {
    this.cancelRefresh();
    this.set('refreshTimer', Ember.run.later(this, 'refreshCluster', 5000));
  },

  refreshCluster() {
    let cluster = this.get('cluster');
    cluster.reload().then(() => {
      if ( cluster.get('state') === 'inactive' ) {
        this.scheduleRefresh();
      } else {
        let project = this.get('projects.current');
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
      this.transitionToRoute('authenticated.clusters');
    }
  },

  configSet: function() {
    return (this.get('kubeconfig')||'').includes('clusters:');
  }.property('kubeconfig'),
});
